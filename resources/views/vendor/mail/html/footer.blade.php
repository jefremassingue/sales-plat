<tr>
<td>
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center">
{{ Illuminate\Mail\Markdown::parse($slot) }}

<!-- Informações de Contato da Empresa -->
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e8e5ef;">
<p style="margin: 0; font-size: 12px; color: #b0adc5; line-height: 1.5;">
<strong style="color: #718096;">{{ config('app.name') }}</strong><br>
Av. Ahmed Sekou Touré nº 3007, Maputo, Moçambique<br>
📞 +258 87 115 4336 | +258 87 0884 336<br>
✉️ <a href="mailto:geral@matonyservicos.com" style="color: #ea7317; text-decoration: none;">geral@matonyservicos.com</a><br>
🌐 <a href="{{ config('app.url') }}" style="color: #ea7317; text-decoration: none;">{{ config('app.url') }}</a>
</p>
<p style="margin: 10px 0 0 0; font-size: 11px; color: #b0adc5;">
Horário de Atendimento: Seg - Sex: 8h às 17h | Sábado: 9h às 13h
</p>
</div>
</td>
</tr>
</table>
</td>
</tr>
