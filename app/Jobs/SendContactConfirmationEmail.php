<?php

namespace App\Jobs;

use App\Mail\ContactConfirmationMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendContactConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $contactData;
    protected $recipientEmail;

    /**
     * Create a new job instance.
     */
    public function __construct(array $contactData, string $recipientEmail)
    {
        $this->contactData = $contactData;
        $this->recipientEmail = $recipientEmail;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Mail::to($this->recipientEmail)->send(new ContactConfirmationMail($this->contactData));
    }
}