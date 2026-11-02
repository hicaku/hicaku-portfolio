// Vercel serverless function: forwards a visitor's message to my inbox through Resend.
// Needs these environment variables on Vercel (never committed):
//   RESEND_API_KEY  – API key from resend.com
//   CONTACT_TO      – the address that receives the messages
//   CONTACT_FROM    – optional sender, default "Portfolio <onboarding@resend.dev>"
const hits = new Map() // tiny per-instance rate limit: 3 messages / 10 min per IP

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const key = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO
  if (!key || !to) return res.status(503).json({ error: 'not configured' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  if (body.site) return res.status(200).json({ ok: true }) // honeypot: pretend it worked
  const message = String(body.message || '').trim().slice(0, 2000)
  const name = String(body.name || '').trim().slice(0, 80)
  const email = String(body.email || '').trim().slice(0, 120)
  if (message.length < 5) return res.status(400).json({ error: 'message' })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'email' })

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x'
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < 600000)
  if (recent.length >= 3) return res.status(429).json({ error: 'slow down' })
  hits.set(ip, [...recent, now])

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Portfolio <onboarding@resend.dev>',
      to: [to],
      reply_to: email || undefined,
      subject: `hicaku.dev message${name ? ' from ' + name.replace(/[\r\n]/g, ' ') : ''}`,
      html: `<p><b>${esc(name) || 'Anonymous'}</b> ${email ? '&lt;' + esc(email) + '&gt;' : '(no email left)'}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    }),
  })
  if (!r.ok) return res.status(502).json({ error: 'send' })
  return res.status(200).json({ ok: true })
}
