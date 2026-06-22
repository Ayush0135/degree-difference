import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, hash } = req.body;

  if (!email || !otp || !hash) {
    return res.status(400).json({ error: 'Email, OTP, and hash are required.' });
  }

  try {
    const [receivedHash, expires] = hash.split('.');

    if (Date.now() > parseInt(expires, 10)) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    const SECRET = process.env.OTP_SECRET || 'fallback_secret_for_development_degreedifference';
    const data = `${email}:${otp}:${expires}`;
    const computedHash = crypto.createHmac('sha256', SECRET).update(data).digest('hex');

    if (computedHash === receivedHash) {
      return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } else {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
}
