<?php

namespace App\Jobs;

use App\Mail\NewQuotationNotificationMail;
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

    protected string $quotationId;
    protected string $recipient;

    public function __construct(string $quotationId, string $recipient)
    {
        $this->quotationId = $quotationId;
        $this->recipient = $recipient;
    }

    public function handle(): void
    {
        $quotation = Quotation::with('customer', 'items')->find($this->quotationId);
        if (!$quotation) {
            Log::warning('Quotation not found for notification email', ['quotation_id' => $this->quotationId]);
            return;
        }

        try {
            Mail::to($this->recipient)->send(new NewQuotationNotificationMail($quotation));
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
