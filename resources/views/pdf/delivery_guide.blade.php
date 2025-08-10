<!DOCTYPE html>
<html lang="pt">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guia de Entrega {{ $deliveryGuide->code }}</title>
    <style>
        /* CSS completo do template de venda para manter a consistência */
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

        #footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 75px;
            font-size: 10px;
            color: #fff !important;
            z-index: 1000;
            padding: 0;
            border-top: 1px solid #f47d15;
        }

        .pagination {
            position: absolute;
            bottom: 10px;
            right: 20px;
            text-align: center;
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
        }

        .container {
            width: 100%;
            padding: 0;
            box-sizing: border-box;
            position: relative;
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

        .document-info, .sale-info {
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

        .document-number, .sale-number {
            font-size: 16px;
            margin-bottom: 5px;
        }

        .document-date, .sale-date {
            margin-bottom: 5px;
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

        .notes-section {
            margin-top: 20px;
            margin-bottom: 20px;
        }

        .notes-content {
            padding: 10px;
            background-color: #f9fafb;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
            min-height: 50px;
            white-space: pre-wrap;
        }
        
        /* <!-- NOVO CSS PARA ASSINATURAS COM TABELA --> */
        .signatures-table {
            width: 100%;
            margin-top: 80px; /* Aumenta o espaço acima das assinaturas */
            margin-bottom: 40px;
            border-collapse: separate; /* Permite o uso de border-spacing */
            border-spacing: 50px 0; /* Adiciona 50px de espaço horizontal entre as células */
        }
        .signatures-table td {
            text-align: center;
        }
        .signature-line-cell {
            height: 50px; /* Espaço vertical para a assinatura */
            border-bottom: 1px solid #191f2b;
        }
        .signature-label-cell {
            padding-top: 8px; /* Espaço entre a linha e o texto */
            font-size: 11px;
            color: #313131;
        }
        /* <!-- FIM DO NOVO CSS --> */

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
            text-align: center;
            font-size: 10px;
            color: #191f2b;
            border-top: 1px solid #f47d15;
            padding-top: 15px;
            padding-bottom: 15px;
            margin-top: 50px;
        }
    </style>
</head>

<body style="padding: 300px 40px 80px 60px;">

    <!-- Cabeçalho fixo (sem alterações) -->
    <div id="header">
        @php
            $headerImagePath = !empty($company['header_image']->value)
                ? public_path('storage/images/company/' . $company['header_image']->value)
                : public_path('images/header.png');
            $headerImagePath = file_exists($headerImagePath) ? $headerImagePath : public_path('images/default-header.png');
        @endphp
        <img class="header-bg-image" src="{{ $headerImagePath }}" alt="Cabeçalho">

        <div class="company-info" style="margin-top: 120px">
            <div class="company-details">{{ $company['company_address']->value ?? 'Endereço da Empresa' }}</div>
            <div class="company-details">Tel: {{ $company['company_phone']->value ?? 'Telefone' }}</div>
            <div class="company-details">{{ $company['company_email']->value ?? 'Email' }}</div>
            <div class="company-details">NUIT: {{ $company['company_tax_number']->value ?? 'NUIT' }}</div>
        </div>

        <div class="document-info">
            <div class="document-title">{{ $documentTitle }}</div>
            <br><br><br>
            <div class="document-number">#{{ $documentNumber }}</div>
            <div class="document-date">Data: {{ \Carbon\Carbon::parse($deliveryGuide->created_at)->format('d/m/Y') }}</div>
            <div class="document-date">Venda Ref: #{{ $sale->sale_number }}</div>
        </div>
    </div>

    <!-- Rodapé fixo (sem alterações) -->
    <div id="footer">
        @php
            $footerImagePath = !empty($company['footer_image']->value)
                ? public_path('storage/images/company/' . $company['footer_image']->value)
                : public_path('images/footer.png');
            $footerImagePath = file_exists($footerImagePath) ? $footerImagePath : public_path('images/default-footer.png');
        @endphp
        <img class="footer-bg-image" src="{{ $footerImagePath }}" alt="Footer">
    </div>

    <div class="container">
        <main>
            <!-- Conteúdo da guia (sem alterações) -->
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

            <div class="section-title">ITENS ENTREGUES</div>
            <table class="table">
                <thead>
                    <tr>
                        <th width="50%">Produto</th>
                        <th width="20%">Quantidade Entregue</th>
                        <th width="30%">Notas do Item</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($deliveryGuide->items as $item)
                        <tr>
                            <td><strong>{{ $item->saleItem->name }}</strong></td>
                            <td>{{ number_format($item->quantity, 2) }} {{ $item->saleItem->unit == 'unit' ? '' : $item->saleItem->unit }}</td>
                            <td>{{ $item->notes ?? '-' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            @if ($deliveryGuide->notes)
                <div class="notes-section">
                    <div class="section-title">NOTAS GERAIS DA GUIA</div>
                    <div class="notes-content">{{ $deliveryGuide->notes }}</div>
                </div>
            @endif

            <!-- <!-- NOVA SEÇÃO DE ASSINATURAS COM TABELA --> 
            <table class="signatures-table">
                <tr>
                    <td class="signature-line-cell"></td>
                    <td class="signature-line-cell"></td>
                </tr>
                <tr>
                    <td class="signature-label-cell">Assinatura do Entregador</td>
                    <td class="signature-label-cell">Assinatura do Cliente</td>
                </tr>
                <tr>
                    <td class=""></td>
                    <td class=""></td>
                </tr>
                <tr>
                    <td class="signature-label-cell"></td>
                    <td class="signature-label-cell">_____/_____/_____</td>
                </tr>
            </table>

            <!-- Rodapé de texto no final do conteúdo -->
            <div class="footer-text">
                <p style="margin: 5px 0;">Documento gerado em {{ now()->format('d/m/Y H:i') }}</p>
                <p style="margin: 5px 0;">{{ $company['company_name']->value ?? 'Nome da Empresa' }} &copy; {{ date('Y') }}</p>
                @if (!empty($company['footer_text']->value))
                    <p style="margin: 5px 0;">{!! $company['footer_text']->value !!}</p>
                @else
                    <p style="margin: 5px 0;">Obrigado pela preferência! Para mais informações, entre em contacto connosco.</p>
                @endif
            </div>
        </main>
    </div>

    <!-- Script para numeração de páginas (sem alterações) -->
    <script type="text/php">
        if (isset($pdf)) {
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