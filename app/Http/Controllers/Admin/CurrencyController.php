<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CurrencyController extends Controller
{
    /**
     * Display a listing of currencies.
     */
    public function index(Request $request)
    {
        try {
            $query = Currency::query();

            // Ordenação
            $sortField = $request->input('sort_field', 'code');
            $sortOrder = $request->input('sort_order', 'asc');

            $allowedSortFields = ['code', 'name', 'exchange_rate', 'is_default', 'is_active'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortOrder);
            }

            $currencies = $query->get();

            return Inertia::render('Admin/Currencies/Index', [
                'currencies' => $currencies,
                'filters' => $request->only(['sort_field', 'sort_order']),
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao listar moedas: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Ocorreu um erro ao listar as moedas: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for creating a new currency.
     */
    public function create()
    {
        return Inertia::render('Admin/Currencies/Create');
    }

    /**
     * Store a newly created currency in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:3|unique:currencies',
                'name' => 'required|string|max:255',
                'symbol' => 'required|string|max:10',
                'exchange_rate' => 'required|numeric|gt:0',
                'is_default' => 'boolean',
                'is_active' => 'boolean',
                'decimal_separator' => 'required|string|max:1',
                'thousand_separator' => 'required|string|max:1|different:decimal_separator',
                'decimal_places' => 'required|integer|min:0|max:4',
            ], [
                'code.required' => 'O código da moeda é obrigatório.',
                'code.max' => 'O código da moeda deve ter no máximo 3 caracteres.',
                'code.unique' => 'Este código de moeda já está em uso.',
                'name.required' => 'O nome da moeda é obrigatório.',
                'symbol.required' => 'O símbolo da moeda é obrigatório.',
                'exchange_rate.required' => 'A taxa de câmbio é obrigatória.',
                'exchange_rate.numeric' => 'A taxa de câmbio deve ser um valor numérico.',
                'exchange_rate.gt' => 'A taxa de câmbio deve ser maior que zero.',
                'decimal_separator.required' => 'O separador decimal é obrigatório.',
                'thousand_separator.required' => 'O separador de milhares é obrigatório.',
                'thousand_separator.different' => 'O separador de milhares deve ser diferente do separador decimal.',
                'decimal_places.required' => 'O número de casas decimais é obrigatório.',
                'decimal_places.min' => 'O número de casas decimais deve ser pelo menos :min.',
                'decimal_places.max' => 'O número de casas decimais não pode ser maior que :max.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                // Se esta moeda for definida como padrão, atualizar todas as outras para não padrão
                if ($request->is_default) {
                    Currency::where('is_default', true)->update(['is_default' => false]);
                }

                // Criar a nova moeda
                $currency = Currency::create($request->all());

                DB::commit();

                return redirect()->route('admin.currencies.index')
                    ->with('success', 'Moeda criada com sucesso!');
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error('Erro ao criar moeda: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao criar a moeda: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação da moeda: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified currency.
     */
    public function show(Currency $currency)
    {
        return Inertia::render('Admin/Currencies/Show', [
            'currency' => $currency,
        ]);
    }

    /**
     * Show the form for editing the specified currency.
     */
    public function edit(Currency $currency)
    {
        return Inertia::render('Admin/Currencies/Edit', [
            'currency' => $currency,
        ]);
    }

    /**
     * Update the specified currency in storage.
     */
    public function update(Request $request, Currency $currency)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => ['required', 'string', 'max:3', Rule::unique('currencies')->ignore($currency->id)],
                'name' => 'required|string|max:255',
                'symbol' => 'required|string|max:10',
                'exchange_rate' => 'required|numeric|gt:0',
                'is_default' => 'boolean',
                'is_active' => 'boolean',
                'decimal_separator' => 'required|string|max:1',
                'thousand_separator' => 'required|string|max:1|different:decimal_separator',
                'decimal_places' => 'required|integer|min:0|max:4',
            ], [
                'code.required' => 'O código da moeda é obrigatório.',
                'code.max' => 'O código da moeda deve ter no máximo 3 caracteres.',
                'code.unique' => 'Este código de moeda já está em uso.',
                'name.required' => 'O nome da moeda é obrigatório.',
                'symbol.required' => 'O símbolo da moeda é obrigatório.',
                'exchange_rate.required' => 'A taxa de câmbio é obrigatória.',
                'exchange_rate.numeric' => 'A taxa de câmbio deve ser um valor numérico.',
                'exchange_rate.gt' => 'A taxa de câmbio deve ser maior que zero.',
                'decimal_separator.required' => 'O separador decimal é obrigatório.',
                'thousand_separator.required' => 'O separador de milhares é obrigatório.',
                'thousand_separator.different' => 'O separador de milhares deve ser diferente do separador decimal.',
                'decimal_places.required' => 'O número de casas decimais é obrigatório.',
                'decimal_places.min' => 'O número de casas decimais deve ser pelo menos :min.',
                'decimal_places.max' => 'O número de casas decimais não pode ser maior que :max.',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            try {
                $wasDefault = $currency->is_default;
                $willBeDefault = $request->is_default;

                // Se a moeda for definida como padrão, atualizar todas as outras para não padrão
                if (!$wasDefault && $willBeDefault) {
                    Currency::where('is_default', true)->update(['is_default' => false]);
                }

                // Se esta é a moeda padrão e está sendo alterada para não padrão, impedir
                if ($wasDefault && !$willBeDefault) {
                    return redirect()->back()
                        ->withErrors(['is_default' => 'Não é possível remover o status de padrão da moeda atual sem definir outra como padrão primeiro.'])
                        ->withInput();
                }

                // Atualizar a moeda
                $currency->update($request->all());

                DB::commit();

                return redirect()->route('admin.currencies.index')
                    ->with('success', 'Moeda atualizada com sucesso!');
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error('Erro ao atualizar moeda: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                    'request' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors(['general' => 'Ocorreu um erro ao atualizar a moeda: ' . $e->getMessage()])
                    ->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Erro na validação da moeda: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['general' => 'Ocorreu um erro ao validar os dados: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Set the specified currency as default.
     */
    public function setDefault(Currency $currency)
    {
        try {
            DB::beginTransaction();

            // Define todas as moedas como não padrão
            Currency::where('is_default', true)->update(['is_default' => false]);

            // Define a moeda selecionada como padrão
            $currency->is_default = true;
            $currency->save();

            DB::commit();

            return redirect()->route('admin.currencies.index')
                ->with('success', 'Moeda padrão atualizada com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao definir moeda padrão: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao definir a moeda padrão: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified currency from storage.
     */
    public function destroy(Currency $currency)
    {
        try {
            // Verificar se é a moeda padrão
            if ($currency->is_default) {
                return redirect()->back()
                    ->with('error', 'Não é possível excluir a moeda padrão. Defina outra moeda como padrão primeiro.');
            }

            DB::beginTransaction();

            // Excluir a moeda
            $currency->delete();

            DB::commit();

            return redirect()->route('admin.currencies.index')
                ->with('success', 'Moeda excluída com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Erro ao excluir moeda: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao excluir a moeda: ' . $e->getMessage());
        }
    }
}
