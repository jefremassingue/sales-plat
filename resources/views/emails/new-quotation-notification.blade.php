@component('mail::message')
# Nova Cotação Recebida

Uma nova cotação foi submetida no site.

**Número da Cotação:** #{{ $quotation->quotation_number }}
**Cliente:** {{ $quotation->customer->name ?? 'N/A' }}
**Email do Cliente:** {{ $quotation->customer->email ?? 'N/A' }}
**Telefone do Cliente:** {{ $quotation->customer->phone ?? 'N/A' }}
**Total:** {{ number_format($quotation->total, 2, ',', '.') }} MZN

**Itens da Cotação:**

@component('mail::table')
| Produto | Quantidade | Preço Unitário | Total |
| :------ | :--------- | :------------- | :---- |
@foreach($quotation->items as $item)
| {{ $item->name }} | {{ $item->quantity }} | {{ number_format($item->unit_price, 2, ',', '.') }} | {{ number_format($item->total, 2, ',', '.') }} |
@endforeach
@endcomponent

@component('mail::button', ['url' => route('admin.quotations.show', $quotation->id)])
Ver Cotação no Admin
@endcomponent

Atenciosamente,
{{ config('app.name') }}
@endcomponent