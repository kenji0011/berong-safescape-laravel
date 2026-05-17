<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetSuccess extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $userName)
    {
        $this->userName = $userName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Berong E-Learning — Password Changed Successfully',
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
     * Build the email HTML inline.
     */
    private function buildHtml(): string
    {
        $name = e($this->userName);
        $time = e(now()->format('M d, Y \a\t h:i A'));

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 24px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">✅ Password Changed</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;">Berong E-Learning Account Security</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px 28px;">
        <p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">Hello <strong>{$name}</strong>,</p>
        <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">Your password was successfully changed on <strong>{$time}</strong>.</p>
        <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">You can now log in with your new password.</p>
        <!-- Security Notice -->
        <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 12px 12px 0;padding:14px 16px;">
          <p style="margin:0;color:#991b1b;font-size:12px;font-weight:600;line-height:1.5;">⚠️ If you did not make this change, please contact us immediately and secure your account.</p>
        </div>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f8fafc;padding:20px 28px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">This is an automated message from Berong E-Learning.<br>Please do not reply to this email.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
HTML;
    }
}
