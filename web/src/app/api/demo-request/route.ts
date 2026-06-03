import { NextRequest, NextResponse } from 'next/server'

const NOTIFY_EMAIL = 'thetrustgrid@gmail.com'
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.trustgrid.ng/api/v1'

function buildNotificationHtml(fields: Record<string, string>) {
  const rows = [
    ['Institution', fields.institutionName],
    ['Type', fields.institutionType],
    ['Contact Name', fields.name],
    ['Role', fields.role],
    ['Phone', fields.phone],
    ['Email', fields.email],
    ['Message', fields.message || '—'],
  ]
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:linear-gradient(135deg,#4F46E5,#0D9488);padding:24px 28px">
        <h2 style="color:white;margin:0;font-size:18px;font-weight:800">New Demo Request — TrustGrid</h2>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">${fields.institutionName} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${rows.map(([label, value], i) => `
          <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
            <td style="padding:12px 20px;font-weight:600;color:#475569;width:160px">${label}</td>
            <td style="padding:12px 20px;color:#0f172a">${value}</td>
          </tr>
        `).join('')}
      </table>
      <div style="padding:20px 28px;background:#f1f5f9;border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:12px;color:#94a3b8">Submitted via trustgrid.ng · Reply to this email to respond directly.</p>
      </div>
    </div>
  `
}

function buildConfirmationHtml(name: string, institutionName: string) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:linear-gradient(135deg,#4F46E5,#0D9488);padding:24px 28px">
        <h2 style="color:white;margin:0;font-size:18px;font-weight:800">Demo request received ✓</h2>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">TrustGrid</p>
      </div>
      <div style="padding:28px">
        <p style="color:#0f172a;font-size:15px;margin:0 0 16px">Hi ${name},</p>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">
          Thank you for your interest in TrustGrid for <strong>${institutionName}</strong>. We have received your demo request and will reach out within <strong>24 hours</strong>.
        </p>
        <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px">
          In the meantime, you can explore the live platform at
          <a href="https://app.trustgrid.ng" style="color:#4F46E5;font-weight:600">app.trustgrid.ng</a>.
        </p>
        <a href="https://app.trustgrid.ng/register" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#0D9488);color:white;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none">
          Get Started →
        </a>
      </div>
      <div style="padding:16px 28px;background:#f1f5f9;border-top:1px solid #e2e8f0">
        <p style="margin:0;font-size:12px;color:#94a3b8">© 2026 TrustGrid · hello@trustgrid.ng · trustgrid.ng</p>
      </div>
    </div>
  `
}

async function sendEmail(apiKey: string, to: string[], subject: string, html: string, replyTo?: string) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'TrustGrid <noreply@trustgrid.ng>',
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { institutionName, name, email, role, phone, institutionType, message } = body

  if (!institutionName || !name || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const fields = { institutionName, name, email: email || '—', role: role || '—', phone, institutionType: institutionType || '—', message: message || '' }

  // 1. Store in backend
  try {
    await fetch(`${BACKEND_URL}/demo-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    })
  } catch {
    // Non-fatal — log but continue
    console.error('[demo-request] Failed to store in backend')
  }

  // 2. Send emails via Resend
  const resendApiKey = process.env.RESEND_API_KEY
  if (resendApiKey) {
    await Promise.allSettled([
      // Notification to TrustGrid team
      sendEmail(
        resendApiKey,
        [NOTIFY_EMAIL],
        `Demo Request — ${institutionName} (${institutionType || 'Unknown type'})`,
        buildNotificationHtml(fields),
        email || undefined,
      ),
      // Confirmation to submitter (only if they provided email)
      ...(email ? [sendEmail(
        resendApiKey,
        [email],
        'Your TrustGrid demo request — we\'ll be in touch',
        buildConfirmationHtml(name, institutionName),
      )] : []),
    ])
  }

  return NextResponse.json({ success: true })
}
