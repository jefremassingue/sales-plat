@component('mail::message')
# Confirmação da Sua Cotação

Olá {{ $quotation->customer->name ?? 'Cliente' }},

Recebemos sua solicitação de cotação com o número **#{{ $quotation->quotation_number }}**.

Nossa equipe está analisando seu pedido e entrará em contato em breve com os detalhes.

**Detalhes da Cotação:**

@component('mail::table')
| Produto | Quantidade |
| :------ | :--------- |
@foreach($quotation->items as $item)
| {{ $item->name }} | {{ $item->quantity }} |
@endforeach

@endcomponent

Se tiver alguma dúvida, por favor, responda a este e-mail.

Obrigado por escolher {{ config('app.name') }}!

Atenciosamente,
{{ config('app.name') }}
@endcomponent