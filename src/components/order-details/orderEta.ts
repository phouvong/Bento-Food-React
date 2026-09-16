// ETA attached to the track-order payload by the backend's EtaLogic
// (per-zone eta_configurations): a {min, max} minute range plus the clock
// window it lands on ("11:00 AM - 11:30 AM", already in the admin panel's
// timezone — display verbatim, never re-localize).
export interface OrderEta {
    // The clock window is the primary display value; the minute range is
    // the fallback when the backend sends only {min, max}. Either half can
    // be null, never both.
    minMinutes: number | null
    maxMinutes: number | null
    window: string | null
}

// The exact field names aren't pinned by the spec, so every consumer goes
// through this normalizer: it accepts the nested (`eta: {min, max, window}`)
// and flat (`eta_min`/`window` on the order itself) spellings, and collapses
// "no ETA configured for this zone" to null so callers can fall back to the
// legacy client-side estimate.
export const normalizeOrderEta = (order: unknown): OrderEta | null => {
    const o = order as Record<string, any> | null | undefined
    if (!o) return null
    const raw = o.eta ?? o.delivery_eta ?? null
    const min = Number(raw?.min ?? o.eta_min)
    const max = Number(raw?.max ?? o.eta_max)
    const hasRange =
        Number.isFinite(min) && Number.isFinite(max) && max > 0
    const windowRaw =
        raw?.window ??
        raw?.time_window ??
        raw?.clock_window ??
        o.eta_window ??
        o.window
    const window =
        typeof windowRaw === 'string' && windowRaw ? windowRaw : null
    if (!hasRange && !window) return null
    return {
        minMinutes: hasRange ? min : null,
        maxMinutes: hasRange ? max : null,
        window,
    }
}
