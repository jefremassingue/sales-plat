<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CustomerController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:admin-customer.index', only: ['index', 'exportPDF']),
            new Middleware('permission:admin-customer.create', only: ['create', 'store']),
            new Middleware('permission:admin-customer.edit', only: ['edit', 'update']),
            new Middleware('permission:admin-customer.show', only: ['show', 'salesExtract', 'quotationsExtract']),
            new Middleware('permission:admin-customer.destroy', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = Customer::query();

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('company_name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('tax_id', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('mobile', 'like', '%' . $search . '%');
            });
        }

        // Filtro de tipo de cliente
        if ($request->has('client_type') && $request->client_type !== null) {
            $query->where('client_type', $request->client_type);
        }

        // Filtro de estado (ativo/inativo)
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active === 'true');
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Incluir o utilizador associado, se existir
        $query->with('user:id,name,email');

        // Paginação
        $customers = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'client_type', 'active', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('Admin/Customers/Create');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocorreu um erro ao carregar o formulário: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validar os dados do cliente
        $validator = Validator::make($request->all(), [
            // Informações principais do cliente
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'client_type' => ['required', Rule::in(['individual', 'company'])],
            'active' => 'boolean',

            // Endereço
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:255',

            // Informações adicionais
            'birth_date' => 'nullable|date',
            'contact_person' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'notes' => 'nullable|string',

            // Dados do utilizador (opcional)
            'connect_user' => 'boolean',
            'user_id' => 'nullable|exists:users,id|required_if:connect_user,true',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Dados para criar o cliente
            $customerData = $request->except(['connect_user', 'user_id']);

            // Se a opção de associar utilizador estiver marcada
            if ($request->connect_user && $request->user_id) {
                // Verificar se o utilizador existe
                $user = User::find($request->user_id);
                if (!$user) {
                    throw new \Exception('O utilizador selecionado não existe.');
                }

                // Adicionar ID do utilizador aos dados do cliente
                $customerData['user_id'] = $user->id;
            }

            // Criar o cliente
            $customer = Customer::create($customerData);

            DB::commit();

            return redirect()->route('admin.customers.index')
                ->with('success', 'Customere criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao criar o cliente: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        // Carregar o utilizador associado, se existir
        $customer->load('user:id,name,email');

        // Buscar estatísticas do cliente
        $salesCount = $customer->sales()->count();
        $salesTotal = $customer->sales()
            ->whereIn('status', ['paid', 'partial'])
            ->sum('total');

        $quotationsCount = $customer->quotations()->count();
        $quotationsTotal = $customer->quotations()
            ->whereNotIn('status', ['draft'])
            ->sum('total');

        $stats = [
            'salesCount' => $salesCount,
            'salesTotal' => $salesTotal,
            'quotationsCount' => $quotationsCount,
            'quotationsTotal' => $quotationsTotal,
        ];

        // Buscar vendas recentes (últimas 5)
        $recentSales = $customer->sales()
            ->with(['currency'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'sale_number' => $sale->sale_number,
                    'issue_date' => $sale->issue_date,
                    'total' => $sale->total,
                    'status' => $sale->status,
                    'currency_code' => $sale->currency_code ?? 'MZN',
                ];
            });

        // Buscar cotações recentes (últimas 5)
        $recentQuotations = $customer->quotations()
            ->with(['currency'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($quotation) {
                return [
                    'id' => $quotation->id,
                    'quotation_number' => $quotation->quotation_number,
                    'issue_date' => $quotation->issue_date,
                    'expiry_date' => $quotation->expiry_date,
                    'total' => $quotation->total,
                    'status' => $quotation->status,
                    'currency_code' => $quotation->currency_code ?? 'MZN',
                ];
            });

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
            'stats' => $stats,
            'recentSales' => $recentSales,
            'recentQuotations' => $recentQuotations,
        ]);
    }

    /**
     * Gerar extrato de vendas do cliente em PDF
     */
    public function salesExtract(Request $request, Customer $customer)
    {
        try {
            $query = $customer->sales()->with(['currency']);

            // Filtros
            if ($request->filled('start_date')) {
                $query->where('issue_date', '>=', $request->start_date);
            }

            if ($request->filled('end_date')) {
                $query->where('issue_date', '<=', $request->end_date);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Ordenação
            $sortField = $request->input('sort_field', 'issue_date');
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortField, $sortOrder);

            $sales = $query->get();

            $totals = [
                'count' => $sales->count(),
                'total' => $sales->sum('total'),
                'paid' => $sales->where('status', 'paid')->sum('total'),
                'pending' => $sales->where('status', 'pending')->sum('total'),
                'partial' => $sales->where('status', 'partial')->sum('total'),
            ];

            $filters = [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->status,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
            ];

            // Carregar informações da empresa e dados bancários
            $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
            $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

            $pdf = Pdf::setOptions([
                'isPhpEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'enable_local_file_access' => true,
                'chroot' => public_path(),
            ])->loadView('exports.sales-statement', [
                'customer' => $customer,
                'sales' => $sales,
                'totals' => $totals,
                'filters' => $filters,
                'generatedAt' => now(),
                'company' => $company,
                'bank' => $bank,
            ]);

            return $pdf->stream("extrato-vendas-{$customer->name}-" . now()->format('Y-m-d') . '.pdf');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao gerar extrato de vendas: ' . $e->getMessage());
        }
    }

    /**
     * Gerar extrato de cotações do cliente em PDF
     */
    public function quotationsExtract(Request $request, Customer $customer)
    {
        try {
            $query = $customer->quotations()->with(['currency']);

            // Filtros
            if ($request->filled('start_date')) {
                $query->where('issue_date', '>=', $request->start_date);
            }

            if ($request->filled('end_date')) {
                $query->where('issue_date', '<=', $request->end_date);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            // Ordenação
            $sortField = $request->input('sort_field', 'issue_date');
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortField, $sortOrder);

            $quotations = $query->get();

            $totals = [
                'count' => $quotations->count(),
                'total' => $quotations->whereNotIn('status', ['draft', 'pending'])->sum('total'),
                'approved' => $quotations->where('status', 'approved')->sum('total'),
                'sent' => $quotations->where('status', 'sent')->sum('total'),
                'expired' => $quotations->where('status', 'expired')->sum('total'),
                'converted' => $quotations->where('status', 'converted')->sum('total'),
            ];

            $filters = [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'status' => $request->status,
                'sort_field' => $sortField,
                'sort_order' => $sortOrder,
            ];

            // Carregar informações da empresa e dados bancários
            $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
            $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

            $pdf = Pdf::setOptions([
                'isPhpEnabled' => true,
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'enable_local_file_access' => true,
                'chroot' => public_path(),
            ])->loadView('exports.quotations-statement', [
                'customer' => $customer,
                'quotations' => $quotations,
                'totals' => $totals,
                'filters' => $filters,
                'generatedAt' => now(),
                'company' => $company,
                'bank' => $bank,
            ]);

            return $pdf->stream("extrato-cotacoes-{$customer->name}-" . now()->format('Y-m-d') . '.pdf');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erro ao gerar extrato de cotações: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        // Carregar o utilizador associado, se existir
        $customer->load('user:id,name,email');

        return Inertia::render('Admin/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        // Validar os dados do cliente
        $validator = Validator::make($request->all(), [
            // Informações principais do cliente
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'client_type' => ['required', Rule::in(['individual', 'company'])],
            'active' => 'boolean',

            // Endereço
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:255',

            // Informações adicionais
            'birth_date' => 'nullable|date',
            'contact_person' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'notes' => 'nullable|string',

            // Dados do utilizador (opcional)
            'connect_user' => 'boolean',
            'user_id' => 'nullable|string|exists:users,id|required_if:connect_user,true',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Dados para atualizar o cliente
            $customerData = $request->except(['connect_user', 'user_id']);

            // Atualizar associação de utilizador
            if ($request->connect_user) {
                // Se solicitou conectar a um utilizador
                if ($request->user_id) {
                    // Verificar se o utilizador existe
                    $user = User::find($request->user_id);
                    if (!$user) {
                        throw new \Exception('O utilizador selecionado não existe.');
                    }
                    $customerData['user_id'] = $user->id;
                }
            } else {
                // Se não solicitou conectar a utilizador, remover a associação
                $customerData['user_id'] = null;
            }

            // Atualizar o cliente
            $customer->update($customerData);

            DB::commit();

            return redirect()->route('admin.customers.index')
                ->with('success', 'Customere atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o cliente: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        try {
            DB::beginTransaction();

            // Não remove o utilizador associado, apenas o cliente
            $customer->delete();

            DB::commit();

            return redirect()->route('admin.customers.index')
                ->with('success', 'Customere eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar o cliente: ' . $e->getMessage());
        }
    }

    /**
     * Pesquisar utilizadores pelo termo.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchUsers(Request $request)
    {
        try {
            $term = $request->input('term');

            if (empty($term) || strlen($term) < 2) {
                return response()->json([]);
            }

            $users = User::where('name', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->limit(10)
                ->get();

            return response()->json($users);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ocorreu um erro ao pesquisar utilizadores'], 500);
        }
    }

    /**
     * Obter informações de um utilizador específico.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUser($id)
    {
        try {
            $user = User::where('id', $id)
                ->select('id', 'name', 'email')
                ->first();

            if (!$user) {
                return response()->json(['error' => 'Utilizador não encontrado'], 404);
            }

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ocorreu um erro ao obter o utilizador'], 500);
        }
    }

    /**
     * Export a listing of the resource to PDF.
     */
    public function exportPDF(Request $request)
    {
        $query = Customer::query();

        // Filtro de busca
        if ($request->has('search') && $request->search !== null && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('company_name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('tax_id', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('mobile', 'like', '%' . $search . '%');
            });
        }

        // Filtro de tipo de cliente
        if ($request->has('client_type') && $request->client_type !== null) {
            $query->where('client_type', $request->client_type);
        }

        // Filtro de estado (ativo/inativo)
        if ($request->has('active') && $request->active !== null) {
            $query->where('active', $request->active === 'true');
        }

        // Ordenação
        $sortField = $request->input('sort_field', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortField, $sortOrder);

        // Obter todos os clientes que correspondem aos filtros
        $customers = $query->get();
// return view('admin.customers.pdf', compact('customers'));
        // Gerar o PDF
        $pdf = Pdf::setOptions([
            'isPhpEnabled'        => true,
            'isHtml5ParserEnabled'=> true,
            'isRemoteEnabled'        => true,            // <-- permite URLs remotas (http/https)
            'enable_local_file_access'=> true,           // <-- permite file:// e acessos locais
            'chroot'                 => public_path(),
        ])->loadView('admin.customers.pdf', compact('customers'));

        // Fazer o download do PDF
        return $pdf->stream('lista_de_clientes.pdf');
    }
}
