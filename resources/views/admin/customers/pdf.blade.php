<!DOCTYPE html>
<html lang="pt">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Clientes</title>
    <style>
        /* CSS Base do Template (sem alterações) */
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
                html,
        body {
            height: 100%;
            margin: 0;
            padding: 0;

            /* Aumentado o padding inferior para acomodar o rodapé maior */
        }


        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #191f2b;
            margin: 0;
        }

        .container {
            width: 100%;
            padding: 0;
            box-sizing: border-box;
            position: relative;
        }

        .header-bg-image, .footer-bg-image {
            position: absolute;
            left: 0;
            width: 100%;
            height: auto;
            z-index: -1;
        }
        .header-bg-image { top: 0; }
        .footer-bg-image { bottom: 0; }
        
        /* .company-info { float: left; width: 50%; margin-top: 120px; }
        .company-details { margin-bottom: 5px; color: #666; } */
        .document-info { float: right; width: 40%; text-align: right; }
        .document-title { font-size: 24px; font-weight: bold; color: #e56e1e; }
        .document-date { margin-top: 30px; }

        /* --- NOVO CSS PARA O LAYOUT DE CARDS DE CLIENTE --- */
        
        /* Contêiner para cada card de cliente, adiciona espaço entre eles */
        .customer-card {
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            margin-bottom: 25px; /* Espaço entre os cards */
            overflow: hidden; /* Garante que a borda arredondada funcione bem */
            page-break-inside: avoid; /* Tenta evitar que um card seja quebrado entre duas páginas */
        }
        
        .card-header {
             background-color: #fef6ee;
             padding: 10px 12px;
             font-weight: bold;
             color: #f47d15;
             border-bottom: 1px solid #e5e7eb;
        }
        
        /* Tabela usada para exibir os detalhes dentro de cada card */
        .details-table {
            width: 100%;
            border-collapse: collapse;
        }

        .details-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: top;
        }
        
        /* Remove a borda da última linha do card */
        .details-table tr:last-child td {
            border-bottom: none;
        }

        /* Coluna do Rótulo (Label): "Nome", "Email", etc. */
        .details-table .label {
            font-weight: bold;
            width: 25%; /* Largura fixa para alinhar os valores */
            background-color: #f9fafb;
            color: #333;
        }

        /* Coluna do Valor (Value): O dado do cliente */
        .details-table .value {
            width: 75%;
            word-wrap: break-word; /* ESSENCIAL: Quebra a linha de textos longos (endereços, etc.) */
        }
        /* --- FIM DO NOVO CSS --- */

        .footer-text {
            text-align: center;
            font-size: 10px;
            color: #191f2b;
            border-top: 1px solid #f47d15;
            padding-top: 15px;
            margin-top: 40px;
        }
        
        .no-clients-message {
            text-align: center; 
            padding: 30px; 
            border: 1px dashed #ccc; 
            background-color: #fafafa;
        }
    </style>
</head>

<body style="padding: 220px 40px 100px 60px;">

    <!-- CABEÇALHO FIXO -->
    <div id="header">
        @php
            $headerImagePath =  public_path('images/header.png');
        @endphp
        <img class="header-bg-image" src="{{ $headerImagePath }}" alt="Cabeçalho">

        <div class="document-info">
            <div class="document-title">Lista de Clientes</div>
            <div class="document-date">Data: {{ now()->format('d/m/Y') }}</div>
        </div>
    </div>

    <!-- RODAPÉ FIXO -->
    <div id="footer">
         @php
            $footerImagePath = public_path('images/footer.png');
        @endphp
        <img class="footer-bg-image" src="{{ $footerImagePath }}" alt="Rodapé">
    </div>

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="container">
        <main>
            @forelse ($customers as $customer)
                <div class="customer-card">
                    <div class="card-header">
                        ID do Cliente: {{ $customer->id }}
                    </div>
                    <table class="details-table">
                        <tbody>
                            <tr>
                                <td class="label">Nome / Empresa</td>
                                <td class="value">{{ $customer->company_name ?? $customer->name ?? 'N/A' }}</td>
                            </tr>
                            <tr>
                                <td class="label">Tipo de Cliente</td>
                                <td class="value">{{ $customer->client_type === 'company' ? 'Empresa' : 'Particular' }}</td>
                            </tr>
                            <tr>
                                <td class="label">Email</td>
                                <td class="value">{{ $customer->email ?? 'N/A' }}</td>
                            </tr>
                            <tr>
                                <td class="label">Contactos</td>
                                <td class="value">
                                    @if($customer->phone)
                                        <span>Principal: {{ $customer->phone }}</span>
                                    @endif
                                    @if($customer->mobile)
                                        <br><span>Alternativo: {{ $customer->mobile }}</span>
                                    @endif
                                    @if(!$customer->phone && !$customer->mobile)
                                        <span>N/A</span>
                                    @endif
                                </td>
                            </tr>
                             <tr>
                                <td class="label">Endereço</td>
                                <td class="value">{{ $customer->address ?? 'N/A' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            @empty
                <div class="no-clients-message">
                    <p>Nenhum cliente encontrado para exibir no relatório.</p>
                </div>
            @endforelse

            <!-- TEXTO NO FIM DO CONTEÚDO -->
            <div class="footer-text">
                <p style="margin: 5px 0;">Documento gerado em {{ now()->format('d/m/Y H:i') }}</p>
                <p style="margin: 5px 0;">{{ $company['company_name']->value ?? 'Matony Serviços' }} &copy; {{ date('Y') }}</p>
            </div>
        </main>
    </div>

    <!-- SCRIPT DE NUMERAÇÃO DE PÁGINAS -->
    <script type="text/php">
        if (isset($pdf)) {
            $x = 540; $y = 820;
            $text = "Página {PAGE_NUM} de {PAGE_COUNT}";
            $font = $fontMetrics->getFont("Arial", "normal");
            $size = 8;
            $color = array(0.18, 0.18, 0.18);
            $pdf->page_text($x, $y, $text, $font, $size, $color);
        }
    </script>
</body>
</html>