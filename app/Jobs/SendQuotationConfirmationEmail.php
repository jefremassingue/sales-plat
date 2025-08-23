<?php

namespace App\Jobs;

use App\Mail\QuotationConfirmationMail;
use App\Models\Quotation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendQuotationConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $quotationId;
    protected $recipientEmail;

    /**
     * Create a new job instance.
     */
    public function __construct(string $quotationId, string $recipientEmail)
    {
        $this->quotationId = $quotationId;
        $this->recipientEmail = $recipientEmail;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $quotation = Quotation::find($this->quotationId);

        if ($quotation) {
            Mail::to($this->recipientEmail)->send(new QuotationConfirmationMail($quotation));
        }
    }
}