import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_fDU7oDNr_HJQWegTM6L7G3w9hKZJYXX5c');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, collegeName, course } = req.body;

  if (!email || !name || !collegeName) {
    return res.status(400).json({ error: 'Email, Name, and College Name are required.' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'DegreeDifference <noreply@degreedifference.com>',
      to: [email],
      subject: 'Admission Approved - DegreeDifference',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Congratulations, ${name}!</h2>
          <p>We are thrilled to inform you that your admission to <strong>${collegeName}</strong>${course ? ` for the <strong>${course}</strong> course` : ''} has been <strong>approved</strong>.</p>
          <p>You will be receiving further instructions regarding your enrollment soon.</p>
          <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46;"><strong>Status:</strong> Approved</p>
          </div>
          <p>Best wishes for your future studies!</p>
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">- The DegreeDifference Team</p>
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
    res.status(500).json({ error: 'Failed to send admission confirmation email.' });
  }
}
