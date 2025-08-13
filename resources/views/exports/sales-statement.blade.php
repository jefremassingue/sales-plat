<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extrato de Vendas - {{ $customer->name }}</title>
    <style>
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
            font-size: 10px;
            color: #fff !important;
            z-index: 1000;
            padding: 0;
            border-top: 1px solid #f47d15;
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

        .document-info {
            float: right;
            width: 60%;
            text-align: right;
        }

        .document-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #e56e1e;
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
            font-size: 10px;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }

        .stats-item {
            display: table-cell;
            text-align: center;
            padding: 10px;
            background-color: #fef6ee;
            border: 1px solid #f47d15;
        }

        .stats-value {
            font-size: 16px;
            font-weight: bold;
            color: #f47d15;
        }

        .stats-label {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
        }

        .filter-info {
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 3px;
            margin-bottom: 20px;
            font-size: 10px;
            border: 1px solid #e5e7eb;
        }

        .status-paid {
            background-color: #dcfce7;
            color: #16a34a;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
        }

        .status-pending {
            background-color: #dbeafe;
            color: #2563eb;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
        }

        .status-partial {
            background-color: #fef3c7;
            color: #d97706;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
        }

        .status-cancelled {
            background-color: #fee2e2;
            color: #dc2626;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
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

        .no-data {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
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
            <div class="company-details">Tel: {{ $company['company_phone']->value ?? 'Telefone' }}</div>
            <div class="company-details">{{ $company['company_email']->value ?? 'Email' }}</div>
            <div class="company-details">NUIT: {{ $company['company_tax_number']->value ?? 'NUIT' }}</div>
        </div>

        <div class="document-info">
            <div class="document-title">EXTRATO DE VENDAS</div>
            <br>
            <br>
            <br>
            <div class="customer-number">Cliente: {{ $customer->name }}</div>
            <div class="generated-date">Gerado em: {{ $generatedAt->format('d/m/Y H:i') }}</div>
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

            <div class="customer-info">
                <div class="section-title">INFORMAÇÕES DO CLIENTE</div>
                <div class="customer-name">{{ $customer->name }}</div>
                @if($customer->email)
                    <div>Email: {{ $customer->email }}</div>
                @endif
                @if($customer->phone)
                    <div>Tel: {{ $customer->phone }}</div>
                @endif
                @if($customer->company_name)
                    <div>Empresa: {{ $customer->company_name }}</div>
                @endif
                @if($customer->address)
                    <div>{{ $customer->address }}</div>
                @endif
            </div>

            @if(!empty($filters['status']) || !empty($filters['start_date']) || !empty($filters['end_date']))
                <div class="filter-info">
                    <strong>Filtros aplicados:</strong>
                    @if(!empty($filters['status']) && $filters['status'] != 'all')
                        Status: {{ ucfirst($filters['status']) }}
                    @endif
                    @if(!empty($filters['start_date']))
                        | Data inicial: {{ \Carbon\Carbon::parse($filters['start_date'])->format('d/m/Y') }}
                    @endif
                    @if(!empty($filters['end_date']))
                        | Data final: {{ \Carbon\Carbon::parse($filters['end_date'])->format('d/m/Y') }}
                    @endif
                </div>
            @endif

            @php
                $totalSales = $sales->count();
                $totalAmount = $sales->sum('total');
                $paidAmount = $sales->where('status', 'paid')->sum('total');
                $pendingAmount = $sales->whereIn('status', ['pending', 'partial'])->sum('amount_due');
            @endphp

            <div class="stats-grid">
                <div class="stats-item">
                    <div class="stats-value">{{ $totalSales }}</div>
                    <div class="stats-label">Total de Vendas</div>
                </div>
                <div class="stats-item">
                    <div class="stats-value">{{ number_format($totalAmount, 2, ',', '.') }} MT</div>
                    <div class="stats-label">Valor Total</div>
                </div>
                <div class="stats-item">
                    <div class="stats-value">{{ number_format($paidAmount, 2, ',', '.') }} MT</div>
                    <div class="stats-label">Valor Pago</div>
                </div>
                <div class="stats-item">
                    <div class="stats-value">{{ number_format($pendingAmount, 2, ',', '.') }} MT</div>
                    <div class="stats-label">Valor Pendente</div>
                </div>
            </div>

            @if($sales->count() > 0)
                <table class="table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Data Emissão</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th class="text-right">Total</th>
                            <th class="text-right">Pago</th>
                            <th class="text-right">Saldo</th>
                            <th class="text-center">Itens</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($sales as $sale)
                            <tr>
                                <td>{{ $sale->sale_number }}</td>
                                <td>{{ $sale->issue_date->format('d/m/Y') }}</td>
                                <td>{{ $sale->due_date ? $sale->due_date->format('d/m/Y') : '-' }}</td>
                                <td>
                                    <span class="status-{{ $sale->status }}">
                                        @switch($sale->status)
                                            @case('paid') Pago @break
                                            @case('pending') Pendente @break
                                            @case('partial') Parcial @break
                                            @case('cancelled') Cancelado @break
                                            @default {{ ucfirst($sale->status) }}
                                        @endswitch
                                    </span>
                                </td>
                                <td class="text-right">{{ number_format($sale->total, 2, ',', '.') }} {{ $sale->currency_code }}</td>
                                <td class="text-right">{{ number_format($sale->amount_paid, 2, ',', '.') }} {{ $sale->currency_code }}</td>
                                <td class="text-right">{{ number_format($sale->amount_due, 2, ',', '.') }} {{ $sale->currency_code }}</td>
                                <td class="text-center">{{ $sale->items->count() }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="no-data">
                    <p>Nenhuma venda encontrada com os filtros aplicados.</p>
                </div>
            @endif

            <div class="footer-text" style="position: relative; z-index: 1;">
                <p style="margin: 5px 0;">Documento gerado em {{ $generatedAt->format('d/m/Y H:i') }}</p>
                <p style="margin: 5px 0;">{{ $company['company_name']->value ?? 'Matony Serviços' }} &copy; {{ date('Y') }}</p>
                @if (!empty($company['footer_text']->value))
                    <p style="margin: 5px 0;">{!! $company['footer_text']->value !!}</p>
                @else
                    <p style="margin: 5px 0;">Extrato de Vendas - {{ $customer->name }}</p>
                @endif
            </div>
        </main>
    </div>

    <!-- Script para numeração de páginas -->
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
