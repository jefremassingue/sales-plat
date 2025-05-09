<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibo #{{ $sale->sale_number }}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .receipt-info {
            margin-bottom: 20px;
        }
        .customer-info {
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border-bottom: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
        }
        .totals {
            margin-top: 20px;
            text-align: right;
        }
        .totals table {
            width: 300px;
            margin-left: auto;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">MATONY</div>
        <div>Ponto de Venda</div>
    </div>

    <div class="receipt-info">
        <div><strong>Recibo:</strong> #{{ $sale->sale_number }}</div>
        <div><strong>Data:</strong> {{ $sale->created_at->format('d/m/Y H:i') }}</div>
        @if($sale->customer)
        <div><strong>Cliente:</strong> {{ $sale->customer->name }}</div>
        @endif
    </div>

    <table>
        <thead>
            <tr>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($sale->items as $item)
            <tr>
                <td>{{ $item->name }}</td>
                <td>{{ $item->quantity }} {{ $item->unit }}</td>
                <td>{{ number_format($item->unit_price, 2) }} {{ $sale->currency->code }}</td>
                <td>{{ number_format($item->total, 2) }} {{ $sale->currency->code }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td><strong>Subtotal:</strong></td>
                <td>{{ number_format($sale->subtotal, 2) }} {{ $sale->currency->code }}</td>
            </tr>
            @if($sale->discount_percentage > 0)
            <tr>
                <td><strong>Desconto ({{ $sale->discount_percentage }}%):</strong></td>
                <td>{{ number_format($sale->discount_amount, 2) }} {{ $sale->currency->code }}</td>
            </tr>
            @endif
            <tr>
                <td><strong>Total:</strong></td>
                <td>{{ number_format($sale->total, 2) }} {{ $sale->currency->code }}</td>
            </tr>
            <tr>
                <td><strong>Pago:</strong></td>
                <td>{{ number_format($sale->amount_paid, 2) }} {{ $sale->currency->code }}</td>
            </tr>
            @if($sale->amount_paid > $sale->total)
            <tr>
                <td><strong>Troco:</strong></td>
                <td>{{ number_format($sale->amount_paid - $sale->total, 2) }} {{ $sale->currency->code }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="footer">
        <p>Obrigado pela sua preferência!</p>
        <p>Este é um recibo eletrônico e não precisa de assinatura.</p>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()">Imprimir Recibo</button>
    </div>
</body>
</html> 