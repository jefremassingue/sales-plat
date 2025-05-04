<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Venda</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
        }
        .header {
            margin-bottom: 20px;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
        }
        .company-name {
            font-weight: bold;
            font-size: 1.2em;
        }
        .message {
            margin-bottom: 20px;
        }
        .sale-info {
            margin: 20px 0;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .payment-info {
            margin-top: 20px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company['name']->value ?? 'Matony' }}</div>
    </div>

    <div class="message">
        <p>Caro(a) {{ $sale->customer->name }},</p>

        <p>Agradecemos a sua preferência. Em anexo enviamos a fatura correspondente à sua compra.</p>

        <div class="sale-info">
            <p><strong>Número da Venda:</strong> {{ $sale->sale_number }}</p>
            <p><strong>Data de Emissão:</strong> {{ date('d/m/Y', strtotime($sale->issue_date)) }}</p>
            <p><strong>Data de Vencimento:</strong> {{ $sale->due_date ? date('d/m/Y', strtotime($sale->due_date)) : 'N/A' }}</p>
            <p><strong>Valor Total:</strong> {{ number_format($sale->total, 2, ',', '.') }} {{ $sale->currency_code }}</p>
        </div>

        <div class="payment-info">
            <p><strong>Valor em Dívida:</strong> {{ number_format($sale->amount_due, 2, ',', '.') }} {{ $sale->currency_code }}</p>

            @if($sale->amount_due > 0)
                <p>Para efetuar o pagamento, por favor use os seguintes dados:</p>

                @if(isset($bank['bank_name']) && isset($bank['account_number']))
                <ul>
                    <li><strong>Banco:</strong> {{ $bank['bank_name']->value }}</li>
                    <li><strong>Número de Conta:</strong> {{ $bank['account_number']->value }}</li>
                    @if(isset($bank['nib']))
                    <li><strong>NIB:</strong> {{ $bank['nib']->value }}</li>
                    @endif
                    <li><strong>Beneficiário:</strong> {{ $company['name']->value ?? 'Matony' }}</li>
                    <li><strong>Referência:</strong> {{ $sale->sale_number }}</li>
                </ul>
                @endif
            @else
                <p>Esta fatura já foi completamente paga. Obrigado!</p>
            @endif
        </div>

        <p>Para quaisquer esclarecimentos adicionais, não hesite em contactar-nos.</p>

        <p>Com os melhores cumprimentos,</p>
        <p>{{ $company['name']->value ?? 'Matony' }}</p>
    </div>

    <div class="footer">
        @if(isset($company['address']))
            <p>{{ $company['address']->value }}</p>
        @endif

        @if(isset($company['phone']))
            <p>Telefone: {{ $company['phone']->value }}</p>
        @endif

        @if(isset($company['email']))
            <p>Email: {{ $company['email']->value }}</p>
        @endif

        @if(isset($company['website']))
            <p>Website: {{ $company['website']->value }}</p>
        @endif
    </div>
</body>
</html>
