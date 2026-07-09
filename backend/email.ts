import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY not found in environment variables.');
}

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn(`Simulating sending email to ${to}: ${subject}`);
    return;
  }

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'support@samadhaan.com', // Must be verified in SendGrid
    subject,
    text,
    html: html || text,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};
