import { Context } from "hono";

interface To {
  email: string;
  name: string;
}

interface MailOptions {
  c: Context;
  to: To[];
  subject: string;
  text: string;
}

export default async function mail({ c, to, subject, text }: MailOptions) {
  const msg = {
    personalizations: [
      {
        to,
        subject,
      },
    ],
    content: [{ type: "text/plain", value: { text } }],
    from: { email: "ceublivre@lucaspinheiro.dev", name: "CeubLivre" },
    reply_to: { email: "ceublivre@lucaspinheiro.dev", name: "CeubLivre" },
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
