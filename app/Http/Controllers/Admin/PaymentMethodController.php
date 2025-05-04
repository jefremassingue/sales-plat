<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paymentMethods = PaymentMethod::orderBy('sort_order')
                                       ->orderBy('name')
                                       ->get();

        return Inertia::render('Admin/Settings/PaymentMethods/Index', [
            'paymentMethods' => $paymentMethods
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $icons = $this->getAvailableIcons();

        return Inertia::render('Admin/Settings/PaymentMethods/Create', [
            'icons' => $icons
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:payment_methods,code',
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'instructions' => 'nullable|string',
                'is_active' => 'boolean',
                'is_default' => 'boolean',
                'sort_order' => 'integer',
                'icon' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            // Se este método for definido como padrão, desmarcar todos os outros
            if ($request->is_default) {
                PaymentMethod::where('is_default', true)->update(['is_default' => false]);
            }

            PaymentMethod::create($request->all());

            DB::commit();

            return redirect()->route('admin.settings.payment-methods.index')
                ->with('success', 'Método de pagamento criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Erro ao criar método de pagamento: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Ocorreu um erro ao criar o método de pagamento: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaymentMethod $paymentMethod)
    {
        $icons = $this->getAvailableIcons();

        return Inertia::render('Admin/Settings/PaymentMethods/Edit', [
            'paymentMethod' => $paymentMethod,
            'icons' => $icons
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('payment_methods')->ignore($paymentMethod->id),
                ],
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'instructions' => 'nullable|string',
                'is_active' => 'boolean',
                'is_default' => 'boolean',
                'sort_order' => 'integer',
                'icon' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            // Se este método for definido como padrão, desmarcar todos os outros
            if ($request->is_default && !$paymentMethod->is_default) {
                PaymentMethod::where('is_default', true)->update(['is_default' => false]);
            }

            $paymentMethod->update($request->all());

            DB::commit();

            return redirect()->route('admin.settings.payment-methods.index')
                ->with('success', 'Método de pagamento atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Erro ao atualizar método de pagamento: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Ocorreu um erro ao atualizar o método de pagamento: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        try {
            DB::beginTransaction();

            // Verificar se o método tem pagamentos associados
            $hasPayments = $paymentMethod->payments()->exists();

            if ($hasPayments) {
                return redirect()->back()
                    ->with('error', 'Este método de pagamento não pode ser excluído pois existem pagamentos associados.');
            }

            // Se for o método padrão, definir outro como padrão
            if ($paymentMethod->is_default) {
                $anotherMethod = PaymentMethod::where('id', '!=', $paymentMethod->id)
                                              ->where('is_active', true)
                                              ->first();

                if ($anotherMethod) {
                    $anotherMethod->is_default = true;
                    $anotherMethod->save();
                }
            }

            $paymentMethod->delete();

            DB::commit();

            return redirect()->route('admin.settings.payment-methods.index')
                ->with('success', 'Método de pagamento excluído com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Erro ao excluir método de pagamento: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao excluir o método de pagamento: ' . $e->getMessage());
        }
    }

    /**
     * Atualizar o status (ativo/inativo)
     */
    public function updateStatus(Request $request, PaymentMethod $paymentMethod)
    {
        try {
            $validator = Validator::make($request->all(), [
                'is_active' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            DB::beginTransaction();

            // Não permitir desativar se for o único método padrão ativo
            if ($paymentMethod->is_default && !$request->is_active) {
                $activeCount = PaymentMethod::where('is_active', true)->count();

                if ($activeCount <= 1) {
                    return redirect()->back()
                        ->with('error', 'Não é possível desativar o único método de pagamento padrão.');
                }

                // Se desativar o padrão, definir outro como padrão
                $anotherMethod = PaymentMethod::where('id', '!=', $paymentMethod->id)
                                             ->where('is_active', true)
                                             ->first();

                if ($anotherMethod) {
                    $anotherMethod->is_default = true;
                    $anotherMethod->save();
                }
            }

            $paymentMethod->is_active = $request->is_active;
            $paymentMethod->save();

            DB::commit();

            return redirect()->route('admin.settings.payment-methods.index')
                ->with('success', 'Status do método de pagamento atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Erro ao atualizar status do método de pagamento: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao atualizar o status do método de pagamento: ' . $e->getMessage());
        }
    }

    /**
     * Definir como método padrão
     */
    public function setDefault(Request $request, PaymentMethod $paymentMethod)
    {
        try {
            if (!$paymentMethod->is_active) {
                return redirect()->back()
                    ->with('error', 'Não é possível definir um método inativo como padrão.');
            }

            DB::beginTransaction();

            // Desmarcar todos os métodos como padrão
            PaymentMethod::where('is_default', true)->update(['is_default' => false]);

            // Marcar este método como padrão
            $paymentMethod->is_default = true;
            $paymentMethod->save();

            DB::commit();

            return redirect()->route('admin.settings.payment-methods.index')
                ->with('success', 'Método de pagamento definido como padrão com sucesso!');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Erro ao definir método de pagamento como padrão: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Ocorreu um erro ao definir o método de pagamento como padrão: ' . $e->getMessage());
        }
    }

    /**
     * Lista de ícones disponíveis
     */
    private function getAvailableIcons()
    {
        return [
            ['name' => 'banknote', 'label' => 'Dinheiro'],
            ['name' => 'building-bank', 'label' => 'Banco'],
            ['name' => 'credit-card', 'label' => 'Cartão de Crédito'],
            ['name' => 'smartphone', 'label' => 'Celular/Mobile'],
            ['name' => 'landmark', 'label' => 'Cheque'],
            ['name' => 'wallet', 'label' => 'Carteira'],
            ['name' => 'receipt', 'label' => 'Recibo'],
            ['name' => 'receipt-text', 'label' => 'Fatura'],
            ['name' => 'globe', 'label' => 'Global'],
            ['name' => 'store', 'label' => 'Loja'],
            ['name' => 'truck', 'label' => 'Entrega'],
            ['name' => 'link', 'label' => 'Link'],
            ['name' => 'money', 'label' => 'Moeda'],
            ['name' => 'paypal', 'label' => 'PayPal'],
            ['name' => 'more-horizontal', 'label' => 'Outro'],
        ];
    }
}
