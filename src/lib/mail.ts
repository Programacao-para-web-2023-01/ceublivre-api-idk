import { Bindings } from "@/app";
import type { Context } from "hono";

interface To {
  email: string;
  name: string;
}

interface MailOptions {
  c: Context<{ Bindings: Bindings }>;
  to: To[];
  subject: string;
  content: string;
}

export async function mail({ c, to, subject, content }: MailOptions) {
  const msg = {
    from: {
      email: "ceublivre@lucaspinheiro.dev",
      name: "CeubLivre",
    },
    personalizations: [
      {
        to,
      },
    ],
    subject,
    content: [
      {
        type: "text/plain",
        value: content,
      },
    ],
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    headers: {
      Authorization: `Bearer ${c.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(msg),
  });

  if (!response.ok) {
    const json = await response.json();
    console.log(json);
  }
}
