export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(_payload: EmailPayload): Promise<void> {
  throw new Error("Resend email delivery is implemented in Phase 6.");
}
