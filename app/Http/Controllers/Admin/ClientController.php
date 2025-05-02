<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {

        $query = Client::query();

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
        $clients = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'client_type', 'active', 'sort_field', 'sort_order']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('Admin/Clients/Create');
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
            'create_user' => 'boolean',
            'user_email' => 'required_if:create_user,true|nullable|email|unique:users,email',
            'user_password' => 'required_if:create_user,true|nullable|min:8',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Dados para criar o cliente
            $clientData = $request->except(['create_user', 'user_email', 'user_password']);

            // Se a opção de criar utilizador estiver marcada, criar um utilizador e associá-lo ao cliente
            if ($request->create_user) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->user_email,
                    'password' => Hash::make($request->user_password),
                ]);

                // Adicionar ID do utilizador aos dados do cliente
                $clientData['user_id'] = $user->id;
            }

            // Criar o cliente
            $client = Client::create($clientData);

            DB::commit();

            return redirect()->route('admin.clients.index')
                ->with('success', 'Cliente criado com sucesso!');
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
    public function show(Client $client)
    {

        // Carregar o utilizador associado, se existir
        $client->load('user:id,name,email');

        return Inertia::render('Admin/Clients/Show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        // Carregar o utilizador associado, se existir
        $client->load('user:id,name,email');

        return Inertia::render('Admin/Clients/Edit', [
            'client' => $client,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
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
            'create_user' => 'boolean',
            'user_email' => [
                'nullable',
                'email',
                Rule::requiredIf($request->create_user && !$client->user_id),
                Rule::unique('users', 'email')->ignore($client->user_id ?? 0),
            ],
            'user_password' => [
                'nullable',
                Rule::requiredIf($request->create_user && !$client->user_id),
                'min:8',
            ],
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Dados para atualizar o cliente
            $clientData = $request->except(['create_user', 'user_email', 'user_password']);

            // Se a opção de criar utilizador estiver marcada e o cliente ainda não tem um utilizador
            if ($request->create_user && !$client->user_id) {
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->user_email,
                    'password' => Hash::make($request->user_password),
                ]);

                // Adicionar ID do utilizador aos dados do cliente
                $clientData['user_id'] = $user->id;
            }

            // Atualizar o cliente
            $client->update($clientData);

            // Se o cliente já tem um utilizador e foi fornecido email/senha novos
            if ($client->user_id && ($request->user_email || $request->user_password)) {
                $userData = [];

                if ($request->user_email) {
                    $userData['email'] = $request->user_email;
                }

                if ($request->user_password) {
                    $userData['password'] = Hash::make($request->user_password);
                }

                if (!empty($userData)) {
                    User::where('id', $client->user_id)->update($userData);
                }
            }

            DB::commit();

            return redirect()->route('admin.clients.index')
                ->with('success', 'Cliente atualizado com sucesso!');
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
    public function destroy(Client $client)
    {
        try {
            DB::beginTransaction();

            // Não remove o utilizador associado, apenas o cliente
            $client->delete();

            DB::commit();

            return redirect()->route('admin.clients.index')
                ->with('success', 'Cliente eliminado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao eliminar o cliente: ' . $e->getMessage());
        }
    }
}
