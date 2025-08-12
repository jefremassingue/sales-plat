<?php

namespace App\Jobs;

use App\Models\Quotation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendQuotationNotificationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    protected int $quotationId;
    protected string $recipient;

    public function __construct(int $quotationId, string $recipient)
    {
        $this->quotationId = $quotationId;
        $this->recipient = $recipient;
    }

    public function handle(): void
    {
        $quotation = Quotation::with('customer')->find($this->quotationId);
        if (!$quotation) {
            Log::warning('Quotation not found for notification email', ['quotation_id' => $this->quotationId]);
            return;
        }

        try {
            Mail::raw(
                "Nova cotação pública recebida: {$quotation->quotation_number}\n".
                "Cliente: {$quotation->customer?->name}\n".
                "Email: {$quotation->customer?->email}\n".
                "Telefone: {$quotation->customer?->phone}\n".
                "Total Estimado: " . number_format((float)$quotation->total, 2) . " {$quotation->currency_code}",
                function ($message) use ($quotation) {
                    $message->to($this->recipient)
                        ->subject('Nova Cotação ' . $quotation->quotation_number);
                }
            );
        } catch (\Throwable $e) {
            Log::error('Erro ao enviar email de notificação de cotação', [
                'error' => $e->getMessage(),
                'quotation_id' => $this->quotationId,
                'recipient' => $this->recipient,
            ]);
            $this->fail($e);
        }
    }
}
