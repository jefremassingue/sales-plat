<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Cotação</title>
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
        .quotation-info {
            margin: 20px 0;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company['name']->value ?? 'Matony' }}</div>
    </div>

    <div class="message">
        <p>Caro(a) {{ $quotation->customer->name }},</p>

        <p>Esperamos que esteja bem. Em anexo enviamos a nossa cotação {{ $quotation->quotation_number }}
           conforme solicitado.</p>

        <div class="quotation-info">
            <p><strong>Número da Cotação:</strong> {{ $quotation->quotation_number }}</p>
            <p><strong>Data de Emissão:</strong> {{ date('d/m/Y', strtotime($quotation->issue_date)) }}</p>
            <p><strong>Validade:</strong> {{ $quotation->expiry_date ? date('d/m/Y', strtotime($quotation->expiry_date)) : 'N/A' }}</p>
            <p><strong>Valor Total:</strong> {{ number_format($quotation->total, 2, ',', '.') }} {{ $quotation->currency_code }}</p>
        </div>

        <p>Para mais informações ou esclarecimentos adicionais, não hesite em contactar-nos.</p>

        <p>Agradecemos a sua preferência.</p>

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
