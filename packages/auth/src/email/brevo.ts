import { env } from '@artxflow/config/server';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailOptions {
  to: string | EmailRecipient;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface BrevoEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
}

/**
 * Dispatches a transactional email via Brevo's v3 SMTP REST API.
 * In development or test environments without a BREVO_API_KEY, simulates delivery
 * and logs the action link to the console for testing convenience.
 */
export async function sendEmail(options: SendEmailOptions): Promise<BrevoEmailResult> {
  const recipient: EmailRecipient =
    typeof options.to === 'string' ? { email: options.to } : options.to;

  const apiKey = env.BREVO_API_KEY;
  const isProduction = env.NODE_ENV === 'production';

  // Development/Test fallback when no Brevo API key is configured
  if (!apiKey) {
    if (isProduction) {
      throw new Error(
        'BREVO_API_KEY is not configured. Transactional emails cannot be sent in production.',
      );
    }

    // Log the email to console for developer ergonomics
    console.info('\n┌───────────────────────────────────────────────────────────┐');
    console.info('│ [ArtXFlow Dev Mailer] Simulating email delivery via Brevo │');
    console.info('├───────────────────────────────────────────────────────────┤');
    console.info(`│ To:      ${recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email}`);
    console.info(`│ Subject: ${options.subject}`);
    if (options.textContent) {
      console.info(`│ Body:    ${options.textContent.slice(0, 200).replace(/\n/g, ' ')}...`);
    }
    console.info('└───────────────────────────────────────────────────────────┘\n');

    return {
      success: true,
      simulated: true,
      messageId: `dev-simulated-${Date.now()}`,
    };
  }

  const senderEmail = env.BREVO_FROM_EMAIL || 'noreply@artxflow.com';
  const senderName = env.BREVO_FROM_NAME || 'ArtXFlow';

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: recipient.email,
        ...(recipient.name ? { name: recipient.name } : {}),
      },
    ],
    subject: options.subject,
    htmlContent: options.htmlContent,
    ...(options.textContent ? { textContent: options.textContent } : {}),
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorJson = (await response.json()) as { message?: string; code?: string };
      if (errorJson?.message) {
        errorMessage = `${errorJson.message} (${errorJson.code || response.status})`;
      }
    } catch {
      // Fall back to status text if body cannot be parsed as JSON
    }
    throw new Error(`Brevo API delivery failed: ${errorMessage}`);
  }

  const data = (await response.json()) as { messageId?: string };
  return {
    success: true,
    messageId: data.messageId,
  };
}
