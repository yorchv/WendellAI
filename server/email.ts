import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.REPL_ID || 'your-jwt-secret';

// Email transporter configuration
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const generateMagicLink = async (email: string): Promise<string> => {
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  const magicLink = `${process.env.APP_URL || 'http://localhost:5000'}/auth/verify?token=${token}`;
  return magicLink;
};

export const sendMagicLinkEmail = async (email: string, magicLink: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@wendelai.com',
    to: email,
    subject: 'Login to WendellAI',
    html: `
      <h1>Welcome to WendellAI</h1>
      <p>Click the link below to login to your account:</p>
      <a href="${magicLink}">Login to WendellAI</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this login link, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
