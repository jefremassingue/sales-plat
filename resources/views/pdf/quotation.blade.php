<!DOCTYPE html>
<html lang="pt">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotação {{ $quotation->quotation_number }}</title>
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
            height: 170px;
            /* Aumentado para acomodar dados bancários */
            font-size: 10px;
            color: #000 !important;
            z-index: 1000;
            padding: 4px 40px 4px 60px;
            /* border-top: 1px solid #f47d15; */
        }

        .bank-details {
            margin: 3px 0;
            font-size: 8px;
            color: #fff;
        }

        .bank-details-title {
            font-weight: bold;
            color: #f47d15;
            margin-bottom: 3px;
            font-size: 9px;
        }

        .footer-info {
            position: relative;
            z-index: 1;
            color: #fff;
            font-size: 8px;
        }

        .footer-info p {
            margin: 2px 0;
            font-size: 8px;
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
            padding-bottom: 75px;

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

        .quotation-info {
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

        .quotation-number {
            font-size: 16px;
            margin-bottom: 5px;
        }

        .quotation-date {
            margin-bottom: 5px;
        }

        .expiry-date {
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

        .status-sent {
            background-color: #dbeafe;
            color: #2563eb;
        }

        .status-approved {
            background-color: #dcfce7;
            color: #16a34a;
        }

        .status-rejected {
            background-color: #fee2e2;
            color: #dc2626;
        }

        .status-expired {
            background-color: #f3f4f6;
            color: #6b7280;
        }

        .status-converted {
            background-color: #f0fdf4;
            color: #16a34a;
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
    </style>
</head>

<body style="padding: 340px 40px 120px 60px;">
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
            <div class="company-details">Emitido por: {{ $quotation->user->name }}</div>

        </div>

        <div class="quotation-info">
            <div class="document-title">COTAÇÃO</div>
            <br>
            <br>
            <br>
            <div class="quotation-number">#{{ $quotation->quotation_number }}</div>
            <div class="quotation-date">Data: {{ \Carbon\Carbon::parse($quotation->issue_date)->format('d/m/Y') }}
            </div>
            <div class="expiry-date">Válido até:
                {{ $quotation->expiry_date ? \Carbon\Carbon::parse($quotation->expiry_date)->format('d/m/Y') : 'N/A' }}
            </div>
        </div>
    </div>

    
    <!-- Rodapé fixo para todas as páginas -->
    <div id="footer">
        @php
            $footerImagePath = !empty($company['footer_image']->value)
                ? public_path('storage/images/company/' . $company['footer_image']->value)
                : public_path('images/footer.png');

            $footerImagePath = file_exists($footerImagePath)
                ? $footerImagePath
                : public_path('images/default-footer.png');
        @endphp

        <img class="footer-bg-image" src="{{ $footerImagePath }}" alt="Footer">

        <div class="" style="width: 100%;">
            <table style="width: 100%;">
                <tr>
                    <td>
                        <br>
                    </td>
                    <td style="text-align: right; vertical-align: top;">
                        <br>
                        <!-- Informações do Footer -->
                        <p style=" margin-bottom: 0px !important; padding-bottom: 0px !important;">Documento gerado em
                            {{ now()->format('d/m/Y H:i') }}</p>
                        {{-- <p style=" margin-bottom: 0px !important; padding-bottom: 0px !important;">
                            {{ $company['company_name']->value ?? 'Matony Serviços' }} &copy; {{ date('Y') }}</p> --}}
                        @if (!empty($company['footer_text']->value))
                            <p style=" margin-bottom: 0px !important; padding-bottom: 0px !important;">
                                {!! $company['footer_text']->value !!}</p>
                        @else
                            <p style=" margin-bottom: 0px !important; padding-bottom: 0px !important;">Obrigado pela
                                preferência!</p>
                        @endif
                    </td>
                </tr>
            </table>
        </div>
    </div>

    <div class="container">
        <main class="main">
            @if ($quotation->customer)
                <div class="customer-info" style="">
                    <div class="section-title">CLIENTE</div>
                    <div class="customer-name">{{ $quotation->customer->name }}</div>
                    @if ($quotation->customer->address)
                        <div>{{ $quotation->customer->address }}</div>
                    @endif
                    @if ($quotation->customer->province)
                        <div>{{ $quotation->customer->city ?? '' }} {{ $quotation->customer->province }}</div>
                    @endif
                    @if ($quotation->customer->tax_number)
                        <div>NUIT: {{ $quotation->customer->tax_number }}</div>
                    @endif
                    @if ($quotation->customer->phone)
                        <div>Tel: {{ $quotation->customer->phone }}</div>
                    @endif
                    @if ($quotation->customer->email)
                        <div>Email: {{ $quotation->customer->email }}</div>
                    @endif
                </div>
            @endif

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
                    @foreach ($quotation->items as $index => $item)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->name }}</strong>

                            </td>
                            <td>{{ number_format($item->quantity, 2) }} {{ $item->unit == 'unit' ? '' : $item->unit }}
                            </td>
                            <td>
                                @if ($currency)
                                    {{ $currency->symbol }}
                                    {{ number_format($item->unit_price, $currency->decimal_places, $currency->decimal_separator, $currency->thousand_separator) }}
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
                                @if ($currency)
                                    {{ $currency->symbol }}
                                    {{ number_format($item->total, $currency->decimal_places, $currency->decimal_separator, $currency->thousand_separator) }}
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
                                                @if ($currency)
                                                    {{ $currency->symbol }}
                                                    {{ number_format($quotation->subtotal, $currency->decimal_places, $currency->decimal_separator, $currency->thousand_separator) }}
                                                @else
                                                    {{ number_format($quotation->subtotal, 2, ',', '.') }} MT
                                                @endif
                                            </td>
                                        </tr>
                                        @if ($quotation->discount_amount > 0)
                                            <tr>
                                                <td style="width: 50%; text-align: right;"><span
                                                        style="font-weight: bold; color: #313131;">Desconto:</span>
                                                </td>
                                                <td style="padding-left: 16px; text-align: right;">
                                                    @if ($currency)
                                                        {{ $currency->symbol }}
                                                        {{ number_format($quotation->discount_amount, $currency->decimal_places, $currency->decimal_separator, $currency->thousand_separator) }}
                                                    @else
                                                        {{ number_format($quotation->discount_amount, 2, ',', '.') }}
                                                        MT
                                                    @endif
                                                </td>
                                            </tr>
                                        @endif
                                        <tr>
                                            <td style="width: 50%; text-align: right;"><span
                                                    style="font-weight: bold; color: #313131;">IVA
                                                    {{ $quotation->include_tax ? '(incluído)' : '' }}:</span></td>
                                            <td style="padding-left: 16px; text-align: right;">
                                                @if ($currency)
                                                    {{ $currency->symbol }}
                                                    {{ number_format($quotation->tax_amount, $currency->decimal_places, $currency->decimal_separator, $currency->thousand_separator) }}
                                                @else
                                                    {{ number_format($quotation->tax_amount, 2, ',', '.') }} MT
                                                @endif
                                            </td>
                                        </tr>
                                        <tr>
                                            <td
                                                style="width: 50%; border-top: 1px solid #f47d15; padding-top: 5px; text-align: right;">
                                                <span style="font-weight: bold; color: #f47d15;">Total:</span>
                                            </td>
                                            <td
                                                style="padding-left: 16px; border-top: 1px solid #f47d15; padding-top: 5px; font-weight: bold; color: #f47d15; text-align: right;">
                                                @if ($currency)
                                                    {{ $currency->symbol }}
                                                    {{ number_format($quotation->total, $currency->decimal_places, $currency->decimal_separator, $currency->thousand_separator) }}
                                                @else
                                                    {{ number_format($quotation->total, 2, ',', '.') }} MT
                                                @endif
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            <br>

            @if ($quotation->notes)
                <div class="notes-section">
                    <div class="section-title">NOTAS</div>
                    <div class="notes-content">{{ $quotation->notes }}</div>
                </div>
            @endif

            @if ($quotation->terms)
                <div class="terms-section">
                    <div class="section-title">TERMOS E CONDIÇÕES</div>
                    <div class="notes-content">{{ $quotation->terms }}</div>
                </div>
            @endif
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
