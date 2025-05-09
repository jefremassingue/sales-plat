<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    public function index()
    {
        // Log para debug - início da requisição
        Log::info('ContactController: Iniciando carregamento da página de contato');

        return Inertia::render('Site/Contact', [
            // Você pode passar dados adicionais aqui se necessário
        ]);
    }

    public function store(Request $request)
    {
        // Validação dos dados do formulário
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Log para debug
        Log::info('ContactController: Formulário de contato recebido', $validated);

        // Aqui você pode implementar o envio de e-mail ou salvar no banco de dados
        // Por exemplo: Mail::to('seu@email.com')->send(new ContactFormMail($validated));

        // Retornar para a página de contato com mensagem de sucesso
        return redirect()->route('contact')->with('success', 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
    }
}
