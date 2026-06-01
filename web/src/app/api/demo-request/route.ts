import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { institutionName, name, role, phone, institutionType, message } = body

  if (!institutionName || !name || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Send to Resend (email delivery)
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TrustGrid Demo Requests <noreply@trustgrid.ng>',
        to: ['hello@trustgrid.ng'],
        subject: `Demo Request — ${institutionName} (${institutionType})`,
        html: `
          <h2>New Demo Request</h2>
          <table style="border-collapse: collapse; width: 100%">
            <tr><td style="padding: 8px; border: 1px solid #eee"><strong>Institution</strong></td><td style="padding: 8px; border: 1px solid #eee">${institutionName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee"><strong>Type</strong></td><td style="padding: 8px; border: 1px solid #eee">${institutionType}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee"><strong>Contact Name</strong></td><td style="padding: 8px; border: 1px solid #eee">${name}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee"><strong>Role</strong></td><td style="padding: 8px; border: 1px solid #eee">${role}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #eee">${phone}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #eee"><strong>Message</strong></td><td style="padding: 8px; border: 1px solid #eee">${message || '—'}</td></tr>
          </table>
        `,
      }),
    })
  }

  return NextResponse.json({ success: true })
}
