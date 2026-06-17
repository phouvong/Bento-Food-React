import React from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { ProfileApi } from '@/hooks/react-query/config/profileApi'
import RenewSubscriptionModal from '@/components/user-info/subscription/RenewSubscriptionModal'

// Subscription record we look for in the /customer/info response.
type CustomerSubscription = {
    id?: number | string
    status?: string
    end_at?: string
}

type RootState = {
    userToken?: { token?: string | null }
}

const looksLikeSub = (v: unknown): v is CustomerSubscription => {
    if (!v || typeof v !== 'object') return false
    const o = v as Record<string, unknown>
    return 'status' in o && 'end_at' in o
}

// Recursive search — the backend variants put the subscription under
// different envelope keys, so we scan the response tree (capped at 4
// levels to avoid cycles) and pick the first object shaped like a
// subscription record.
const findSub = (
    root: unknown,
    depth = 0
): CustomerSubscription | undefined => {
    if (!root || typeof root !== 'object' || depth > 4) return undefined
    const obj = root as Record<string, unknown>
    if (looksLikeSub(obj)) return obj
    for (const v of Object.values(obj)) {
        const found = findSub(v, depth + 1)
        if (found) return found
    }
    return undefined
}

const ExpiredSubscriptionPrompt: React.FC = () => {
    const { t } = useTranslation()
    const router = useRouter()
    // React to login transitions: when this slice flips from null/empty
    // to a token string, the effect below re-runs and fires the check.
    const token = useSelector((s: RootState) => s?.userToken?.token)
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        if (!token) return
        let cancelled = false
        const req = ProfileApi.profileInfo()
        if (!req) return
        req.then((res: { data?: { data?: unknown } } | undefined) => {
            if (cancelled) return
            const root = res?.data?.data ?? res?.data
            const sub = findSub(root)
            if (sub?.status !== 'expired') return
            // One-time dedupe per subscription id. Written at the moment
            // we open the modal so re-renders / route changes can't
            // re-trigger it. A future renewed subscription with a new
            // id will get its own dismiss key when it eventually expires.
            const subId = sub.id
            if (subId === undefined || subId === null) return
            const dismissKey = `renew_expired_shown_${subId}`
            if (typeof window === 'undefined') return
            if (window.localStorage.getItem(dismissKey) === '1') return
            window.localStorage.setItem(dismissKey, '1')
            setOpen(true)
        }).catch(() => {
            // Silent — global error handlers cover real API failures.
        })
        return () => {
            cancelled = true
        }
    }, [token])

    return (
        <RenewSubscriptionModal
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={() => {
                setOpen(false)
                router.push('/info?page=subscription')
            }}
            t={t as (key: string) => string}
            description={t(
                'Your plan is expired. Renew now to continue enjoying exclusive benefits and savings.'
            ) as string}
        />
    )
}

export default ExpiredSubscriptionPrompt
