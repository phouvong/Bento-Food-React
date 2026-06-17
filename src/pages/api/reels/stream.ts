import type { NextApiRequest, NextApiResponse } from 'next'

// Proxy endpoint that adds auth headers to the reel stream request.
// This lets the browser's <video> element make Range requests natively,
// enabling progressive playback without MSE/blob complexity.
//
// Usage: /api/reels/stream?reel_id=123&t=TOKEN&zid=ZONE_ID
//
// The browser handles all buffering, seeking, and Range requests automatically.

export const config = {
    api: {
        // Remove the 4 MB response limit so large videos stream through.
        responseLimit: false,
    },
}

// All query params come in as `string | string[] | undefined`. Pick the first
// string if Next gave us an array (only one value is ever sent).
const firstString = (v: string | string[] | undefined): string | undefined => {
    if (Array.isArray(v)) return v[0]
    return v
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
): Promise<void> {
    const reelId = firstString(req.query.reel_id)
    const token = firstString(req.query.t)
    const zoneid = firstString(req.query.zid)
    const lang = firstString(req.query.lang)
    const lat = firstString(req.query.lat)
    const lng = firstString(req.query.lng)
    const guestId = firstString(req.query.guest_id)

    if (!reelId) {
        res.status(400).json({ error: 'reel_id required' })
        return
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '')
    const guestParam = guestId ? `&guest_id=${guestId}` : ''
    const upstreamUrl = `${baseUrl}/api/v1/customer/reels/details?reel_id=${reelId}&stream=1${guestParam}`

    const upstreamHeaders: Record<string, string> = {
        Accept: 'video/*,*/*',
        'X-software-id': '33571750',
    }

    if (token) upstreamHeaders['Authorization'] = `Bearer ${token}`
    if (zoneid) upstreamHeaders['zoneid'] = zoneid
    if (lang) upstreamHeaders['X-localization'] = lang
    if (lat) upstreamHeaders['latitude'] = lat
    if (lng) upstreamHeaders['longitude'] = lng

    // Forward the browser's own Range if present (for seeks/partial reads);
    // otherwise request the full file as a single 206 (`bytes=0-`).
    const rangeHeader = req.headers['range']
    upstreamHeaders['Range'] = (typeof rangeHeader === 'string'
        ? rangeHeader
        : Array.isArray(rangeHeader)
        ? rangeHeader[0]
        : undefined) ?? 'bytes=0-'

    let upstream: Response
    try {
        upstream = await fetch(upstreamUrl, { headers: upstreamHeaders })
    } catch {
        res.status(502).json({ error: 'upstream fetch failed' })
        return
    }

    res.status(upstream.status)

    const forward = [
        'content-type',
        'content-length',
        'content-range',
        'accept-ranges',
    ]
    forward.forEach((h) => {
        const val = upstream.headers.get(h)
        if (val) res.setHeader(h, val)
    })

    res.setHeader('Cache-Control', 'private, no-store')

    if (!upstream.body) {
        res.end()
        return
    }

    // Pipe the upstream body to the response. Web ReadableStream → Node res.
    const reader = upstream.body.getReader()
    const pump = (): void => {
        reader
            .read()
            .then(({ value, done }) => {
                if (done) {
                    res.end()
                    return
                }
                res.write(Buffer.from(value))
                pump()
            })
            .catch(() => res.end())
    }
    pump()
}
