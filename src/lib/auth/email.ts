import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function parseFromAddress(from: string): { email: string; name?: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { email: from.trim() };
}

// Sends email via SendGrid when configured; otherwise logs in development.
export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY?.trim();
  const fromRaw = process.env.EMAIL_FROM?.trim() ?? "Crypto Sentry <shawaiz.work64@gmail.com>";

  if (!apiKey) {
    console.info(`[email] SENDGRID_API_KEY not set — verification email for ${to}:\n${text}`);
    return;
  }

  const from = parseFromAddress(fromRaw);

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from,
      subject,
      content: [
        { type: "text/plain", value: text },
        { type: "text/html", value: html },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send email (${res.status}): ${body}`);
  }
}
