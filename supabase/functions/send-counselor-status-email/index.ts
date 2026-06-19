import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, status } = await req.json()
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY secret")
    }

    let subject = '';
    let html = '';

    if (status === 'suspended') {
      subject = 'Account Suspended - Degree Difference';
      html = `<h2>Hello ${name},</h2><p>Your counselor account has been <strong>suspended</strong> pending review by the administration.</p><p>You will not be able to log in or manage students at this time. Please contact support for more details.</p><br><p>Best,<br>Degree Difference Team</p>`;
    } else if (status === 'blocked') {
      subject = 'Account Blocked - Degree Difference';
      html = `<h2>Hello ${name},</h2><p>Your counselor account has been <strong>blocked</strong> due to policy violations.</p><p>You are no longer authorized to act as a counselor on our platform. Please contact the administration immediately if you believe this is an error.</p><br><p>Best,<br>Degree Difference Team</p>`;
    } else if (status === 'active') {
      subject = 'Account Reactivated - Degree Difference';
      html = `<h2>Hello ${name},</h2><p>Good news! Your counselor account has been <strong>reactivated</strong>.</p><p>You may now log in and resume your activities on the platform.</p><br><p>Best,<br>Degree Difference Team</p>`;
    } else if (status === 'deleted') {
      subject = 'Account Deleted - Degree Difference';
      html = `<h2>Hello ${name},</h2><p>Your counselor account has been <strong>permanently deleted</strong> from our system.</p><p>If you have any questions, please contact the administration.</p><br><p>Best,<br>Degree Difference Team</p>`;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'DegreeDifference <noreply@degreedifference.com>',
        to: email,
        subject,
        html,
      }),
    })

    const data = await res.json()

    if (res.ok) {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
