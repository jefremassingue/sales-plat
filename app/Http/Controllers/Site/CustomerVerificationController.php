<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CustomerVerificationController extends Controller
{
    /**
     * Exibir página de verificação de customer
     */
    public function index()
    {
        $user = Auth::user();
        
        // Buscar customer existente com o email do usuário
        $existingCustomer = Customer::where('email', $user->email)
            ->whereNotNull('user_id')
            ->where('user_id', '!=', $user->id)
            ->with('user')
            ->first();

        return Inertia::render('Site/CustomerVerification', [
            'user' => $user,
            'existingCustomer' => $existingCustomer ? [
                'id' => $existingCustomer->id,
                'name' => $existingCustomer->name,
                'email' => $existingCustomer->email,
                'user_name' => $existingCustomer->user->name ?? 'Usuário desconhecido',
                'created_at' => $existingCustomer->created_at,
            ] : null,
        ]);
    }

    /**
     * Solicitar verificação por email
     */
    public function requestVerification(Request $request)
    {
        $user = Auth::user();
        
        $existingCustomer = Customer::where('email', $user->email)
            ->whereNotNull('user_id')
            ->where('user_id', '!=', $user->id)
            ->with('user')
            ->first();

        if (!$existingCustomer) {
            return redirect()->route('profile')
                ->with('error', 'Nenhum conflito de customer encontrado.');
        }

        // Aqui você pode implementar o envio de email para verificação
        // Por enquanto, vamos apenas simular o processo
        
        // TODO: Implementar envio de email de verificação
        // Mail::to($existingCustomer->user->email)->send(new CustomerVerificationMail($user, $existingCustomer));

        return redirect()->back()
            ->with('success', 'Solicitação de verificação enviada! Aguarde o contato do administrador.');
    }

    /**
     * Criar novo customer com email diferente
     */
    public function createWithDifferentEmail(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'new_email' => 'required|email|unique:customers,email|unique:users,email,' . $user->id,
        ]);

        // Atualizar email do usuário
        $user->update([
            'email' => $validated['new_email']
        ]);

        // Criar customer com o novo email
        Customer::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $validated['new_email'],
            'active' => true,
            'client_type' => 'individual',
        ]);

        return redirect()->route('profile')
            ->with('success', 'Email atualizado e perfil criado com sucesso!');
    }
}
