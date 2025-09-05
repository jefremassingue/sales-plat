<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Sale;
use App\Models\Quotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Buscar ou criar customer para o usuário autenticado
     */
    private function getOrCreateCustomer()
    {
        $user = Auth::user();

        // 1. Buscar customer associado ao usuário autenticado
        $customer = Customer::where('user_id', $user->id)->first();

        if ($customer) {
            return $customer;
        }

        // 2. Se não encontrou por user_id, buscar por email sem user_id
        $customerByEmail = Customer::where('email', $user->email)
            ->whereNull('user_id')
            ->first();

        if ($customerByEmail) {
            // Associar o customer existente ao usuário
            $customerByEmail->update(['user_id' => $user->id]);
            return $customerByEmail;
        }

        // 3. Verificar se já existe customer com esse email mas com outro user_id
        $existingCustomerWithUser = Customer::where('email', $user->email)
            ->whereNotNull('user_id')
            ->where('user_id', '!=', $user->id)
            ->first();

        if ($existingCustomerWithUser) {
            // Redirecionar para página de verificação personalizada
            return redirect()->route('customer.verification')
                ->with('warning', 'Foi encontrado um conflito com seu email. Por favor, resolva a situação abaixo.');
        }

        // 4. Se não existir customer, criar um novo
        $customer = Customer::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'active' => true,
            'client_type' => 'individual',
        ]);

        return $customer;
    }

    /**
     * Exibir o perfil do customer
     */
    public function index()
    {

        if (auth()->user()->can('admin-dashboard.__invoke')) {
            return redirect()->route('dashboard');
        }
        $customer = $this->getOrCreateCustomer();

        // Se retornou um redirect (conflito), retorná-lo
        if ($customer instanceof \Illuminate\Http\RedirectResponse) {
            return $customer;
        }

        // Carregar dados relacionados
        $customer->load(['user']);

        // Estatísticas do customer
        $salesCount = Sale::where('customer_id', $customer->id)->count();
        $salesTotal = Sale::where('customer_id', $customer->id)->sum('total');
        $quotationsCount = Quotation::where('customer_id', $customer->id)->count();

        // Vendas recentes (últimas 5)
        $recentSales = Sale::where('customer_id', $customer->id)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Cotações recentes (últimas 5) - apenas as que podem mostrar preço
        $recentQuotations = Quotation::where('customer_id', $customer->id)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($quotation) {
                // Ocultar preços de cotações em rascunho
                if (!in_array($quotation->status, ['sent', 'approved', 'rejected', 'expired', 'converted'])) {
                    $quotation->total = null;
                    $quotation->hide_price = true;
                }
                return $quotation;
            });

        $response = Inertia::render('Site/Profile', [
            'customer' => $customer,
            'stats' => [
                'salesCount' => $salesCount,
                'salesTotal' => $salesTotal,
                'quotationsCount' => $quotationsCount,
            ],
            'recentSales' => $recentSales,
            'recentQuotations' => $recentQuotations,
        ]);

        $title = 'Minha Conta - ' . $customer->name;
        $description = 'Acesse sua área de cliente na Matony para visualizar seu histórico de compras, cotações, atualizar seus dados e muito mais.';

        return $response->title($title)
            ->description($description, 160)
            ->ogMeta()
            ->twitterLargeCard();
    }

    /**
     * Exibir formulário de edição do perfil
     */
    public function edit()
    {
        if (auth()->user()->can('admin-dashboard.__invoke')) {
            return redirect()->route('dashboard');
        }
        $customer = $this->getOrCreateCustomer();

        // Se retornou um redirect (conflito), retorná-lo
        if ($customer instanceof \Illuminate\Http\RedirectResponse) {
            return $customer;
        }

        return Inertia::render('Site/Profile/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Atualizar dados do perfil
     */
    public function update(Request $request)
    {
        $customer = $this->getOrCreateCustomer();

        // Se retornou um redirect (conflito), retorná-lo
        if ($customer instanceof \Illuminate\Http\RedirectResponse) {
            return $customer;
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('customers', 'email')
                    ->ignore($customer->id)
                    ->where(function ($query) use ($customer) {
                        return $query->where('user_id', '!=', $customer->user_id);
                    }),
            ],
            'company_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'contact_person' => 'nullable|string|max:255',
            'billing_address' => 'nullable|string|max:500',
            'shipping_address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'client_type' => 'required|in:individual,company',
            'notes' => 'nullable|string|max:1000',
        ]);

        $customer->update($validated);

        // Atualizar também o nome e email do usuário se necessário
        $user = Auth::user();
        if ($user->name !== $validated['name'] || $user->email !== $validated['email']) {
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);
        }

        return redirect()->route('profile')
            ->with('success', 'Perfil atualizado com sucesso!');
    }

    /**
     * Exibir extrato completo de vendas
     */
    public function salesStatement(Request $request)
    {
        $customer = $this->getOrCreateCustomer();

        // Se retornou um redirect (conflito), retorná-lo
        if ($customer instanceof \Illuminate\Http\RedirectResponse) {
            return $customer;
        }

        $query = Sale::where('customer_id', $customer->id)
            ->with(['items.product', 'currency']);

        // Filtros
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        // Ordenação
        $orderBy = $request->get('order_by', 'issue_date');
        $orderDirection = $request->get('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        $sales = $query->paginate(10);

        // Estatísticas do período
        $totalSales = $query->count();
        $totalAmount = $query->sum('total');
        $paidAmount = $query->where('status', 'paid')->sum('total');
        $pendingAmount = $query->whereIn('status', ['pending', 'partial'])->sum('amount_due');

        $response = Inertia::render('Site/Profile/SalesStatement', [
            'customer' => $customer,
            'sales' => $sales,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'order_by', 'order_direction']),
            'stats' => [
                'totalSales' => $totalSales,
                'totalAmount' => $totalAmount,
                'paidAmount' => $paidAmount,
                'pendingAmount' => $pendingAmount,
            ],
        ]);

        $title = 'Meu Histórico de Compras - Matony';
        $description = 'Consulte seu histórico completo de compras e o status de cada pedido na sua área de cliente Matony.';

        return $response->title($title)
            ->description($description, 160)
            ->ogMeta()
            ->twitterLargeCard();
    }

    /**
     * Exibir extrato completo de cotações
     */
    public function quotationsStatement(Request $request)
    {
        $customer = $this->getOrCreateCustomer();

        // Se retornou um redirect (conflito), retorná-lo
        if ($customer instanceof \Illuminate\Http\RedirectResponse) {
            return $customer;
        }

        $query = Quotation::where('customer_id', $customer->id)
            ->with(['items.product', 'currency', 'sale']);

        // Filtros
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        // Ordenação
        $orderBy = $request->get('order_by', 'issue_date');
        $orderDirection = $request->get('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        $quotations = $query->paginate(10);

        // Estatísticas do período (apenas cotações com preços visíveis)
        $totalQuotations = $query->count();
        $visibleQuotations = $query->whereIn('status', ['sent', 'approved', 'rejected', 'expired', 'converted']);
        $totalAmount = $visibleQuotations->sum('total');
        $approvedAmount = $query->where('status', 'approved')->sum('total');
        $convertedAmount = $query->where('status', 'converted')->sum('total');

        $response = Inertia::render('Site/Profile/QuotationsStatement', [
            'customer' => $customer,
            'quotations' => $quotations,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'order_by', 'order_direction']),
            'stats' => [
                'totalQuotations' => $totalQuotations,
                'totalAmount' => $totalAmount,
                'approvedAmount' => $approvedAmount,
                'convertedAmount' => $convertedAmount,
            ],
        ]);

        $title = 'Minhas Cotações - Matony';
        $description = 'Acompanhe todas as suas cotações, visualize propostas e o status de cada uma em sua área de cliente Matony.';

        return $response->title($title)
            ->description($description, 160)
            ->ogMeta()
            ->twitterLargeCard();
    }

    /**
     * Exportar extrato de vendas em PDF
     */
    public function exportSalesStatement(Request $request)
    {
        $customer = $this->getOrCreateCustomer();

        // Se retornou um redirect (conflito), retorná-lo
        if ($customer instanceof \Illuminate\Http\RedirectResponse) {
            return $customer;
        }

        $query = Sale::where('customer_id', $customer->id)
            ->with(['items.product', 'currency']);

        // Aplicar os mesmos filtros
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        $sales = $query->get();

        // Carregar informações da empresa e dados bancários
        $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
        $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

        $pdf = Pdf::loadView('exports.sales-statement', [
            'customer' => $customer,
            'sales' => $sales,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
            'generatedAt' => now(),
            'company' => $company,
            'bank' => $bank,
        ]);

        $filename = 'extrato-vendas-' . $customer->name . '-' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Exportar extrato de cotações em PDF
     */
    public function exportQuotationsStatement(Request $request)
    {
        $customer = $this->getOrCreateCustomer();

        // Se retornou um redirect (conflito), retorná-lo
        if ($customer instanceof \Illuminate\Http\RedirectResponse) {
            return $customer;
        }

        $query = Quotation::where('customer_id', $customer->id)
            ->with(['items.product', 'currency', 'sale']);

        // Aplicar os mesmos filtros
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        $quotations = $query->get();

        // Carregar informações da empresa e dados bancários
        $company = DB::table('settings')->where('group', 'company')->get()->keyBy('key');
        $bank = DB::table('settings')->where('group', 'bank')->get()->keyBy('key');

        $pdf = Pdf::loadView('exports.quotations-statement', [
            'customer' => $customer,
            'quotations' => $quotations,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
            'generatedAt' => now(),
            'company' => $company,
            'bank' => $bank,
        ]);

        $filename = 'extrato-cotacoes-' . $customer->name . '-' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }
}
