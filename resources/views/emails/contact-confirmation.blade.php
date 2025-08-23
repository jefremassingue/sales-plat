@component('mail::message')
# Olá {{ $name }},

Obrigado por entrar em contato conosco! Recebemos sua mensagem com o assunto "{{ $subject }}".

Nossa equipe está analisando sua solicitação e responderá o mais breve possível.

Atenciosamente,
{{ config('app.name') }}
@endcomponent