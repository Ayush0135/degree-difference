import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_fDU7oDNr_HJQWegTM6L7G3w9hKZJYXX5c');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, name } = req.body;

  if (!email || !otp || !name) {
    return res.status(400).json({ error: 'Email, OTP, and Name are required.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'DegreeDifference <noreply@degreedifference.com>',
      to: [email],
      subject: 'Your DegreeDifference Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to DegreeDifference, ${name}!</h2>
          <p>Thank you for signing up. Please use the following One-Time Password (OTP) to complete your verification process:</p>
          <div style="background-color: #f3f4f6; padding: 16px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; letter-spacing: 4px; color: #0d9488;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">This code is valid for your current session.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Failed to send OTP.' });
  }
}
