<!DOCTYPE html>
<html lang="pt">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Venda {{ $sale->sale_number }}</title>
    <style>
        /* @page {
            size: A4;
            margin: 110px 40px 90px 40px;
        } */


        /* Estilos para cabeçalho em todas as páginas */
        #header {
            position: fixed;
            top: 0px;
            left: 0;
            right: 0;
            height: 80px;
            background-color: #fff;
            z-index: 1000;
            padding: 60px 40px 40px 60px;

        }

        /* Estilos para rodapé em todas as páginas */
        #footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 75px;
            /* Aumentado para acomodar dados bancários */
            font-size: 10px;
            color: #fff !important;
            z-index: 1000;
            padding: 0;
            border-top: 1px solid #f47d15;
        }

        .bank-details {
            margin: 5px 0;
            border-top: 1px dotted #e5e7eb;
            padding-top: 5px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
        }

        .bank-details-title {
            font-weight: bold;
            color: #f47d15;
        }

        .pagination {
            position: absolute;
            bottom: 10px;
            right: 20px text-align: center;
            font-size: 9px;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.3;
            color: #191f2b;
            margin: 0;
        }

        html,
        body {
            height: 100%;
            margin: 0;
            padding: 0;

            /* Aumentado o padding inferior para acomodar o rodapé maior */
        }

        .container {
            width: 100%;
            padding: 0;
            box-sizing: border-box;
            position: relative;
            /* padding: 340px 40px 80px 60px; */
        }

        .header {
            margin-bottom: 30px;
            position: relative;
        }

        .header::after {
            content: "";
            clear: both;
            display: table;
        }

        .header-bg-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            opacity: 1;
            z-index: -1;
            margin: 0;
            padding: 0;
        }

        .company-logo {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 10px;
        }

        .company-info {
            float: left;
            width: 50%;
        }

        .company-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #f47d15;
        }

        .company-details {
            margin-bottom: 5px;
            color: #666;
        }

        .sale-info {
            float: right;
            width: 40%;
            text-align: right;
        }

        .document-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #e56e1e;
        }

        .sale-number {
            font-size: 16px;
            margin-bottom: 5px;
        }

        .sale-date {
            margin-bottom: 5px;
        }

        .due-date {
            margin-bottom: 15px;
        }

        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .status-draft {
            background-color: #e5e7eb;
            color: #4b5563;
        }

        .status-pending {
            background-color: #dbeafe;
            color: #2563eb;
        }

        .status-paid {
            background-color: #dcfce7;
            color: #16a34a;
        }

        .status-partial {
            background-color: #fef3c7;
            color: #d97706;
        }

        .status-overdue {
            background-color: #fee2e2;
            color: #dc2626;
        }

        .status-canceled {
            background-color: #f3f4f6;
            color: #6b7280;
        }

        .customer-info {
            margin-bottom: 30px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid #f47d15;
            padding-bottom: 5px;
            color: #f47d15;
        }

        .customer-name {
            font-weight: bold;
            margin-bottom: 5px;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .table th {
            background-color: #fef6ee;
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #f47d15;
            font-weight: bold;
            color: #f47d15;
        }

        .table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }

        .table tr:last-child td {
            border-bottom: none;
        }

        .text-right {
            text-align: right;
        }

        .totals {
            width: 40%;
            margin-left: auto;
            margin-bottom: 30px;
        }

        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }

        .total-label {
            font-weight: normal;
        }

        .total-value {
            font-weight: normal;
        }

        .grand-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #f47d15;
            padding-top: 5px;
            margin-top: 5px;
            color: #f47d15;
        }

        .notes-section {
            margin-bottom: 20px;
        }

        .notes-content {
            padding: 10px;
            background-color: #f9fafb;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
            min-height: 50px;
        }

        .terms-section {
            margin-bottom: 20px;
        }

        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #191f2b;
            border-top: 1px solid #f47d15;
            padding-top: 15px;
            padding-bottom: 15px;
            position: relative;
            width: 100%;
            clear: both;
            display: block;
            bottom: 0;
        }

        .footer-bg-image {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: auto;
            opacity: 1;
            z-index: -1;
            margin: 0;
            padding: 0;
            display: block;
        }

        .footer-text {
            position: relative;
            z-index: 1;
        }

        .item-description {
            font-size: 11px;
            color: #6b7280;
            margin-top: 3px;
        }

        .payment-info {
            margin-top: 20px;
            margin-bottom: 20px;
        }

        .payment-table {
            width: 120%;
            border-collapse: collapse;
        }

        .payment-table th {
            background-color: #fef6ee;
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #f47d15;
        }

        .payment-table td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
    </style>
</head>

<body style="padding: 340px 40px 60px 60px;">
    <!-- Cabeçalho fixo para todas as páginas -->
    <div id="header">

        @php
            $headerImagePath = !empty($company['header_image']->value)
                ? public_path('storage/images/company/' . $company['header_image']->value)
                : public_path('images/header.png');

            $headerImagePath = file_exists($headerImagePath)
                ? $headerImagePath
                : public_path('images/default-header.png');
        @endphp

        <img class="header-bg-image" src="{{ $headerImagePath }}" alt="Cabeçalho">

        <div class="company-info" style="margin-top: 120px">
            <div class="company-details">{{ $company['company_address']->value ?? 'Endereço da Empresa' }}</div>
            {{-- <div class="company-details">{{ $company['company_city']->value ?? 'Cidade' }},
                {{ $company['company_province']->value ?? 'Província' }}</div> --}}
            <div class="company-details">Tel: {{ $company['company_phone']->value ?? 'Telefone' }}</div>
            <div class="company-details">{{ $company['company_email']->value ?? 'Email' }}</div>
            <div class="company-details">NUIT: {{ $company['company_tax_number']->value ?? 'NUIT' }}</div>
        </div>

        <div class="sale-info">
            <div class="document-title">{{ $documentTitle }}</div>
            <br>
            <br>
            <br>
            @if ($documentSufix == 'P')
                <div class="sale-number">PAGAMENTO PARCIAL</div>
            @endif
            <div class="sale-number">#{{ $documentNumber }}</div>
            <div class="sale-date">
                Data:
                {{ isset($payment) ? \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y') : \Carbon\Carbon::parse($sale->issue_date)->format('d/m/Y') }}
            </div>

            @if ($documentTitle === 'FATURA')
                <div class="due-date">
                    Vencimento: {{ $sale->due_date ? \Carbon\Carbon::parse($sale->due_date)->format('d/m/Y') : 'N/A' }}
                </div>
            @endif
        </div>
    </div>

    <!-- Rodapé fixo para todas as páginas -->
    <div id="footer">
        <div class="footer-text">
            @php
                $footerImagePath = !empty($company['footer_image']->value)
                    ? public_path('storage/images/company/' . $company['footer_image']->value)
                    : public_path('images/footer.png');

                $footerImagePath = file_exists($footerImagePath)
                    ? $footerImagePath
                    : public_path('images/default-footer.png');
            @endphp

            <img class="footer-bg-image" src="{{ $footerImagePath }}" alt="Footer">
        </div>
    </div>

    <div class="container">
        <main class="main">
            @if ($sale->customer)
                <div class="customer-info" style="width: 70%;">
                    <div class="section-title">CLIENTE</div>
                    <div class="customer-name">{{ $sale->customer->name }}</div>
                    @if ($sale->customer->address)
                        <div>{{ $sale->customer->address }}</div>
                    @endif
                    @if ($sale->customer->province)
                        <div>{{ $sale->customer->city ?? '' }} {{ $sale->customer->province }}</div>
                    @endif
                    @if ($sale->customer->tax_number)
                        <div>NUIT: {{ $sale->customer->tax_number }}</div>
                    @endif
                    @if ($sale->customer->phone)
                        <div>Tel: {{ $sale->customer->phone }}</div>
                    @endif
                    @if ($sale->customer->email)
                        <div>Email: {{ $sale->customer->email }}</div>
                    @endif

                </div>
            @endif


            <div class="section-title">ITENS</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="5%">#</th>
                        <th width="35%">Descrição</th>
                        <th width="10%">Qtd.</th>
                        <th width="15%">Preço Unit.</th>
                        <th width="10%">IVA</th>
                        <th width="10%">Desconto</th>
                        <th width="15%">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($sale->items as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->name }}</strong>

                            </td>
                            <td>{{ number_format($item->quantity, 2) }} {{ $item->unit == 'unit' ? '' : $item->unit }}
                            </td>
                            <td>
                                @if ($item->currency)
                                    {{ $item->currency->symbol }}
                                    {{ number_format($item->unit_price, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                @else
                                    {{ number_format($item->unit_price, 2, ',', '.') }} MT
                                @endif
                            </td>
                            <td>
                                @if ($item->tax_percentage > 0)
                                    {{ number_format($item->tax_percentage, 2) }}%
                                @else
                                    Isento
                                @endif
                            </td>
                            <td>
                                @if ($item->discount_percentage > 0)
                                    {{ number_format($item->discount_percentage, 2) }}%
                                @else
                                    -
                                @endif
                            </td>
                            <td class="text-right" style="white-space: nowrap;">
                                @if ($item->currency)
                                    {{ $item->currency->symbol }}
                                    {{ number_format($item->total, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                @else
                                    {{ number_format($item->total, 2, ',', '.') }} MT
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="">
                <table style="width: 100%;">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <br>
                            <br>
                            <div class="bank-info">
                                <div class="" style="font-weight: bold; font-size: 13px; margin-bottom: 8px">
                                    Informação Bancária
                                </div>
                                <table style="width: auto; border-collapse: collapse;">
                                    <tr>
                                        <td style=" width: 30%;"><span
                                                style="font-weight: bold; color: #313131;">Banco:</span></td>
                                        <td style="padding-left: 16px">{{ $bank['bank_name']->value ?? 'BIM' }}</td>
                                    </tr>
                                    <tr>

                                        <td style=" width: 30%;"><span style="font-weight: bold; color: #313131;">Número
                                                De Conta:</span></td>
                                        <td style="padding-left: 16px">
                                            {{ $bank['account_number']->value ?? '1231881377' }}</td>
                                    </tr>
                                    <tr>
                                        <td style=""><span style="font-weight: bold; color: #313131;">NIB:</span>
                                        </td>
                                        <td style="padding-left: 16px" colspan="3">
                                            {{ $bank['nib']->value ?? '0001 0000 01231881377 57' }}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Informações de pagamento -->
                            @if (($sale->payments && count($sale->payments) > 0 && $documentSufix != 'R') || ($documentSufix == 'R' && count($sale->payments) > 1))
                                <div class="payment-info">
                                    <div
                                        style="font-weight: bold; font-size: 13px; margin-bottom: 8px; margin-top: 20px">
                                        Histórico de Pagamentos
                                    </div>
                                    <table class="payment-table">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Método</th>
                                                <th>Referência</th>
                                                <th style="text-align: right">Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach ($sale->payments as $payment)
                                                <tr>
                                                    <td>{{ \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y') }}
                                                    </td>
                                                    <td>
                                                        @switch($payment->payment_method)
                                                            @case('cash')
                                                                Dinheiro
                                                            @break

                                                            @case('bank_transfer')
                                                                Transferência Bancária
                                                            @break

                                                            @case('mpesa')
                                                                M-Pesa
                                                            @break

                                                            @case('credit_card')
                                                                Cartão de Crédito
                                                            @break

                                                            @case('cheque')
                                                                Cheque
                                                            @break

                                                            @default
                                                                {{ $payment->payment_method }}
                                                        @endswitch
                                                    </td>
                                                    <td>{{ $payment->reference ?? '-' }}</td>
                                                    <td style="text-align: right">
                                                        @if ($item->currency)
                                                            {{ $item->currency->symbol }}
                                                            {{ number_format($payment->amount, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                        @else
                                                            {{ number_format($payment->amount, 2, ',', '.') }} MT
                                                        @endif
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @endif
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <div class="" style="text-align: right; float: right;">
                                <div class="section-title" style="text-align: right;">
                                    RESUMO
                                </div>
                                <div class="notes-content"
                                    style="background-color: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb; padding: 15px; text-align: right;">
                                    <table style="width: 100%; border-collapse: collapse; margin-left: auto;">
                                        <tr>
                                            <td style="width: 50%; text-align: right;"><span
                                                    style="font-weight: bold; color: #313131;">Subtotal:</span></td>
                                            <td style="padding-left: 16px; text-align: right;">
                                                @if ($item->currency)
                                                    {{ $item->currency->symbol }}
                                                    {{ number_format($sale->subtotal, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                @else
                                                    {{ number_format($sale->subtotal, 2, ',', '.') }} MT
                                                @endif
                                            </td>
                                        </tr>
                                        @if ($sale->discount_amount > 0)
                                            <tr>
                                                <td style="width: 50%; text-align: right;"><span
                                                        style="font-weight: bold; color: #313131;">Desconto:</span></td>
                                                <td style="padding-left: 16px; text-align: right;">
                                                    @if ($item->currency)
                                                        {{ $item->currency->symbol }}
                                                        {{ number_format($sale->discount_amount, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                    @else
                                                        {{ number_format($sale->discount_amount, 2, ',', '.') }} MT
                                                    @endif
                                                </td>
                                            </tr>
                                        @endif
                                        <tr>
                                            <td style="width: 50%; text-align: right;"><span
                                                    style="font-weight: bold; color: #313131;">IVA
                                                    {{ $sale->include_tax ? '(incluído)' : '' }}:</span></td>
                                            <td style="padding-left: 16px; text-align: right;">
                                                @if ($item->currency)
                                                    {{ $item->currency->symbol }}
                                                    {{ number_format($sale->tax_amount, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                @else
                                                    {{ number_format($sale->tax_amount, 2, ',', '.') }} MT
                                                @endif
                                            </td>
                                        </tr>
                                        @if ($sale->shipping_amount > 0)
                                            <tr>
                                                <td style="width: 50%; text-align: right;"><span
                                                        style="font-weight: bold; color: #313131;">Transporte:</span>
                                                </td>
                                                <td style="padding-left: 16px; text-align: right;">
                                                    @if ($item->currency)
                                                        {{ $item->currency->symbol }}
                                                        {{ number_format($sale->shipping_amount, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                    @else
                                                        {{ number_format($sale->shipping_amount, 2, ',', '.') }} MT
                                                    @endif
                                                </td>
                                            </tr>
                                        @endif
                                        <tr>
                                            <td
                                                style="width: 50%; border-top: 1px solid #f47d15; padding-top: 5px; text-align: right;">
                                                <span style="font-weight: bold; color: #f47d15;">Total:</span>
                                            </td>
                                            <td
                                                style="padding-left: 16px; border-top: 1px solid #f47d15; padding-top: 5px; font-weight: bold; color: #f47d15; text-align: right;">
                                                @if ($item->currency)
                                                    {{ $item->currency->symbol }}
                                                    {{ number_format($sale->total, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                @else
                                                    {{ number_format($sale->total, 2, ',', '.') }} MT
                                                @endif
                                            </td>
                                        </tr>

                                        <!-- Linha para valor pago e valor em dívida -->
                                        @if (($sale->amount_paid > 0 || $sale->amount_due > 0) && $documentSufix != 'R')
                                            <tr>
                                                <td colspan="2" style="height: 10px"></td>
                                            </tr>
                                            <tr>
                                                <td style="width: 50%; text-align: right;"><span
                                                        style="font-weight: bold; color: #313131;">Valor Pago:</span>
                                                </td>
                                                <td style="padding-left: 16px; text-align: right; color: #16a34a;">
                                                    @if ($item->currency)
                                                        {{ $item->currency->symbol }}
                                                        {{ number_format($sale->amount_paid, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                    @else
                                                        {{ number_format($sale->amount_paid, 2, ',', '.') }} MT
                                                    @endif
                                                </td>
                                            </tr>
                                            @if ($documentSufix != 'R')

                                                <tr>
                                                    <td
                                                        style="width: 50%; border-top: 1px solid #f47d15; padding-top: 5px; text-align: right;">
                                                        <span style="font-weight: bold; color: #f47d15;">Valor em
                                                            Dívida:</span>
                                                    </td>
                                                    <td
                                                        style="padding-left: 16px; border-top: 1px solid #f47d15; padding-top: 5px; font-weight: bold; text-align: right; color: {{ $sale->amount_due > 0 ? '#dc2626' : '#16a34a' }};">
                                                        @if ($item->currency)
                                                            {{ $item->currency->symbol }}
                                                            {{ number_format($sale->amount_due, $item->currency->decimal_places, $item->currency->decimal_separator, $item->currency->thousand_separator) }}
                                                        @else
                                                            {{ number_format($sale->amount_due, 2, ',', '.') }} MT
                                                        @endif
                                                    </td>
                                                </tr>
                                            @endif

                                        @endif
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <br>

            @if ($sale->notes)
                <div class="notes-section">
                    <div class="section-title">NOTAS</div>
                    <div class="notes-content">{{ $sale->notes }}</div>
                </div>
            @endif

            @if ($sale->terms)
                <div class="terms-section">
                    <div class="section-title">TERMOS E CONDIÇÕES</div>
                    <div class="notes-content">{{ $sale->terms }}</div>
                </div>
            @endif

            <div class="footer-text" style="position: relative; z-index: 1;">
                <p style="margin: 5px 0;">Documento gerado em {{ now()->format('d/m/Y H:i') }}</p>
                <p style="margin: 5px 0;">{{ $company['company_name']->value ?? 'Nome da Empresa' }} &copy;
                    {{ date('Y') }}</p>
                @if (!empty($company['footer_text']->value))
                    <p style="margin: 5px 0;">{!! $company['footer_text']->value !!}</p>
                @else
                    <p style="margin: 5px 0;">Obrigado pela preferência! Para mais informações, entre em contacto
                        connosco.</p>
                @endif
            </div>
        </main>
    </div>

    <!-- Script para numeração de páginas - versão corrigida -->
    <script type="text/php">
        if (isset($pdf)) {
            // Ajuste X e Y conforme necessário para que caiba dentro do rodapé
            $x = 546;
            $y = 826;
            $text = "Pág. {PAGE_NUM} de {PAGE_COUNT}";
            $font = $fontMetrics->getFont("Arial", "normal");
            $size = 7;
            $pdf->page_text($x, $y, $text, $font, $size, array(254, 254, 254));
        }
    </script>
</body>

</html>
