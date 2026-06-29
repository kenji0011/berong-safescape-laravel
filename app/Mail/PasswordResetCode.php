<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class PasswordResetCode extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $code;
    public string $userName;
    public string $expiresInMinutes;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code, string $userName, int $expiresInMinutes = 10)
    {
        $this->code = $code;
        $this->userName = $userName;
        $this->expiresInMinutes = (string) $expiresInMinutes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Berong E-Learning — Password Reset Code',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    /**
     * Build the email HTML inline (no blade dependency).
     */
    private function buildHtml(): string
    {
        $code = e($this->code);
        $name = e($this->userName);
        $expires = e($this->expiresInMinutes);

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:60px 20px;">
  <tr><td align="center">
    <!-- Main Card matching the Auth Page style -->
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:500px;background:#ffffff;border:3px solid #fb923c;border-radius:32px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
      <!-- Header -->
      <tr><td style="padding:40px 40px 10px;text-align:center;">
        <h1 style="margin:0 0 12px;color:#d60000;font-size:32px;font-weight:900;letter-spacing:-1px;">Berong E-Learning</h1>
        
        <!-- Pill badge -->
        <table align="center" cellpadding="0" cellspacing="0" role="presentation">
          <tr><td style="border:1px solid #e2e8f0;border-radius:999px;padding:6px 16px;background:#ffffff;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <p style="margin:0;font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1px;">BFP Sta Cruz Fire Safety Education</p>
          </td></tr>
        </table>
      </td></tr>
      
      <!-- Body -->
      <tr><td style="padding:24px 40px 40px;text-align:center;">
        <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;font-weight:800;">Password Reset Request</h2>
        <p style="margin:0 0 32px;color:#475569;font-size:14px;line-height:1.6;font-weight:500;">Hello <strong>{$name}</strong>, you've requested to reset your password. Use the code below to securely regain access to your account:</p>
        
        <!-- Code Box matching input fields / cards -->
        <div style="background:#fffaf5;border:2px solid #fb923c;border-radius:20px;padding:24px;text-align:center;margin:0 0 32px;box-shadow:0 4px 6px -1px rgba(251, 146, 60, 0.1);">
          <p style="margin:0 0 8px;color:#ea580c;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">Verification Code</p>
          <p style="margin:0;color:#d60000;font-size:46px;font-weight:900;letter-spacing:12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">{$code}</p>
        </div>
        
        <p style="margin:0 0 24px;color:#64748b;font-size:13px;line-height:1.6;font-weight:500;">⏱ This code expires in <strong>{$expires} minutes</strong>.</p>
        
        <!-- Security Notice -->
        <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:16px;padding:16px;text-align:left;">
          <p style="margin:0 0 6px;color:#991b1b;font-size:14px;font-weight:800;">Security Tip</p>
          <p style="margin:0;color:#b91c1c;font-size:13px;font-weight:500;line-height:1.5;">Never share this code with anyone. Berong staff will never ask for your verification code.</p>
        </div>
      </td></tr>
      
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;font-weight:600;">If you didn't request this, you can safely ignore this email.</p>
        <p style="margin:0;color:#cbd5e1;font-size:11px;font-weight:500;">&copy; 2026 Berong E-Learning.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
    }
}
