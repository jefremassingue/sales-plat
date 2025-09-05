<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Jobs\SendContactFormEmail;
use App\Jobs\SendContactConfirmationEmail;

class ContactController extends Controller
{
    public function index()
    {
        // Log para debug - início da requisição
        Log::info('ContactController: Iniciando carregamento da página de contato');

        $response = Inertia::render('Site/Contact', [
            // Você pode passar dados adicionais aqui se necessário
        ]);

        $title = 'Contacto - Fale com a Matony';
        $description = 'Entre em contato com a Matony. Estamos prontos para atender suas dúvidas, solicitações de orçamento ou fornecer suporte. Envie sua mensagem ou ligue para nós.';

        return $response->title($title)
            ->description($description, 160)
            ->image(asset('og.png'))
            ->ogMeta()
            ->twitterLargeCard();
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

        ContactMessage::create($validated);

        // Enviar email de confirmação para o cliente
        SendContactConfirmationEmail::dispatch($validated, $validated['email']);

        // Enviar email para o admin via Job
        $recipients = config('mail.admin_email', []);
        if (is_array($recipients) && !empty($recipients)) {
            foreach ($recipients as $email) {
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    continue;
                }
                SendContactFormEmail::dispatch($validated, $email);
            }
        }

        // Retornar para a página de contato com mensagem de sucesso
        return redirect()->route('contact')->with('success', 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
    }
}
