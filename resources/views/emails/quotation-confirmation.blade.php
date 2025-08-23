@component('mail::message')
# Confirmação da Sua Solicitação de Cotação

Olá {{ $quotation->customer->name ?? 'Prezado' }},

Recebemos sua solicitação de cotação nº **#{{ $quotation->quotation_number }}**.

Nossa equipe já está analisando o seu pedido e em breve você receberá a **cotação completa com todos os valores e condições**.

**Resumo do Pedido Solicitado:**

@component('mail::table')
| Produto | Quantidade |
| :------ | :--------- |
@foreach($quotation->items as $item)
| {{ $item->name }} | {{ $item->quantity }} |
@endforeach
@endcomponent

Fique atento à sua caixa de entrada — em breve enviaremos os detalhes completos da sua cotação.  

Se tiver alguma dúvida, estamos à disposição para ajudar.

Obrigado por escolher {{ config('app.name') }}!  

Atenciosamente,  
{{ config('app.name') }}
@endcomponent
