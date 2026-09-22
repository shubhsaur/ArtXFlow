export interface PasswordResetEmailParams {
  name?: string | null;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface VerificationEmailParams {
  name?: string | null;
  verifyUrl: string;
  expiresInHours?: number;
}

export interface RenderedEmail {
  subject: string;
  htmlContent: string;
  textContent: string;
}

function baseEmailLayout(contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ArtXFlow Notification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070B12;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #F5F7FA;
    }
    .wrapper {
      width: 100%;
      background-color: #070B12;
      padding: 40px 16px;
    }
    .card {
      max-width: 520px;
      margin: 0 auto;
      background-color: #0D1420;
      border: 1px solid #1C2A3A;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    }
    .logo-container {
      margin-bottom: 28px;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #F5F7FA;
      text-decoration: none;
    }
    .logo-gradient {
      background: linear-gradient(135deg, #0B87FE 0%, #19D7FE 50%, #7A5CFD 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #F5F7FA;
      margin: 0 0 16px 0;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #AAB5C4;
      margin: 0 0 20px 0;
    }
    .btn-container {
      margin: 28px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #0B87FE 0%, #19D7FE 100%);
      color: #070B12 !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 8px;
      text-align: center;
    }
    .security-note {
      font-size: 12px;
      color: #718096;
      border-top: 1px solid #1C2A3A;
      padding-top: 20px;
      margin-top: 28px;
      line-height: 1.5;
    }
    .raw-url {
      word-break: break-all;
      color: #19D7FE;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo-container">
        <span class="logo-text">Art<span class="logo-gradient">X</span>Flow</span>
      </div>
      ${contentHtml}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Renders transactional email for password reset.
 */
export function renderPasswordResetEmail(params: PasswordResetEmailParams): RenderedEmail {
  const greeting = params.name ? `Hello ${params.name},` : 'Hello,';
  const expiresText = `${params.expiresInMinutes || 60} minutes`;

  const htmlBody = `
    <h1>Reset your ArtXFlow password</h1>
    <p>${greeting}</p>
    <p>We received a request to reset the password for your ArtXFlow account. Click the button below to choose a new password:</p>
    <div class="btn-container">
      <a href="${params.resetUrl}" class="button" target="_blank" rel="noopener noreferrer">Reset Password →</a>
    </div>
    <p>This password reset link is valid for <strong>${expiresText}</strong>.</p>
    <div class="security-note">
      <p style="margin: 0 0 8px 0;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      <p style="margin: 0;">If the button above does not work, copy and paste this URL into your browser:</p>
      <p class="raw-url" style="margin: 4px 0 0 0;">${params.resetUrl}</p>
    </div>
  `;

  const textContent = `${greeting}

We received a request to reset the password for your ArtXFlow account.
Follow this link to choose a new password:
${params.resetUrl}

This link is valid for ${expiresText}.
If you did not request this password reset, please ignore this email.`;

  return {
    subject: 'Reset your ArtXFlow password',
    htmlContent: baseEmailLayout(htmlBody),
    textContent,
  };
}

/**
 * Renders transactional email for email address verification.
 */
export function renderVerificationEmail(params: VerificationEmailParams): RenderedEmail {
  const greeting = params.name ? `Hello ${params.name},` : 'Hello,';
  const expiresText = `${params.expiresInHours || 24} hours`;

  const htmlBody = `
    <h1>Verify your ArtXFlow email address</h1>
    <p>${greeting}</p>
    <p>Welcome to ArtXFlow! Please verify your email address to secure your workspace and enable full content distribution capabilities:</p>
    <div class="btn-container">
      <a href="${params.verifyUrl}" class="button" target="_blank" rel="noopener noreferrer">Verify Email Address →</a>
    </div>
    <p>This verification link is valid for <strong>${expiresText}</strong>.</p>
    <div class="security-note">
      <p style="margin: 0 0 8px 0;">If you did not create an account on ArtXFlow, please disregard this message.</p>
      <p style="margin: 0;">If the button above does not work, copy and paste this URL into your browser:</p>
      <p class="raw-url" style="margin: 4px 0 0 0;">${params.verifyUrl}</p>
    </div>
  `;

  const textContent = `${greeting}

Welcome to ArtXFlow! Please verify your email address by visiting this URL:
${params.verifyUrl}

This link is valid for ${expiresText}.
If you did not create an account on ArtXFlow, please disregard this message.`;

  return {
    subject: 'Verify your ArtXFlow email address',
    htmlContent: baseEmailLayout(htmlBody),
    textContent,
  };
}
