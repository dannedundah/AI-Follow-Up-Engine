import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });

  return transporter;
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  const t = getTransporter();

  return t.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text: body,
  });
};
