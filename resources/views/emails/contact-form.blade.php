@component('mail::message')
# Nova Mensagem de Contato

Você recebeu uma nova mensagem através do formulário de contato do site.

**Nome:** {{ $name }}
**Email:** {{ $email }}
**Telefone:** {{ $phone }}
**Assunto:** {{ $subject }}

**Mensagem:**
{{ $messageContent }}

Obrigado,
{{ config('app.name') }}
@endcomponent