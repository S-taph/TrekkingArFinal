// mailer utility using Gmail SMTP via Nodemailer
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SMTP_USER,
    pass: process.env.GMAIL_SMTP_PASS,
  },
})

export const sendAdminNotificationEmail = async ({ subject, html }) => {
  const to = (process.env.ADMIN_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean)
  if (to.length === 0) return { skipped: true }
  return transporter.sendMail({ from: process.env.GMAIL_SMTP_USER, to, subject, html })
}

export const sendReplyToUser = async ({ to, subject, html }) => {
  if (!to) throw new Error('Missing recipient email')
  return transporter.sendMail({ from: process.env.GMAIL_SMTP_USER, to, subject, html })
}
