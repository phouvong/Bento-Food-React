import { useEffect, useState } from 'react'
import useGetRunningHappyHour from '@/hooks/react-query/happy-hour/useGetRunningHappyHour'
import useGetHappyHourStores from '@/hooks/react-query/happy-hour/useGetHappyHourStores'

interface UseHappyHourBannerParams {
    restaurantId?: number | string
    cartSubtotal?: number
}

export interface HappyHourBannerState {
    show: boolean
    expireAt: number | null
    windowMinutes: number
    remainingAmount: number
    discountPercent: number
    amountProgress: number | null
}

export default function useHappyHourBanner({
    restaurantId,
    cartSubtotal = 0,
}: UseHappyHourBannerParams): HappyHourBannerState {
    const { data: runningHappyHourData } = useGetRunningHappyHour()
    const runningHappyHour = runningHappyHourData?.is_running
        ? runningHappyHourData?.happy_hour
        : null

    const { data: happyHourStoresData } = useGetHappyHourStores({
        running: true,
        enabled: Boolean(runningHappyHour),
    })
    const happyHourStore = restaurantId
        ? happyHourStoresData?.restaurants?.find(
              (store) => Number(store.id) === Number(restaurantId)
          )
        : undefined

    const [expireAt, setExpireAt] = useState<number | null>(null)
    useEffect(() => {
        const remainingSeconds =
            Number(runningHappyHour?.remaining_seconds) || 0
        setExpireAt(
            remainingSeconds > 0 ? Date.now() + remainingSeconds * 1000 : null
        )
    }, [runningHappyHour?.id, runningHappyHour?.remaining_seconds])

    // Progress base = the full window length; 'T' join because Safari won't
    // parse the backend's space-separated datetime format.
    const windowMinutes = (() => {
        const start = runningHappyHour?.started_at
        const end = runningHappyHour?.ends_at
        if (!start || !end) return 60
        const ms =
            new Date(String(end).replace(' ', 'T')).getTime() -
            new Date(String(start).replace(' ', 'T')).getTime()
        return ms > 0 ? Math.round(ms / 60000) : 60
    })()

    const minOrder = Number(runningHappyHour?.min_order_amount) || 0

    return {
        show: Boolean(happyHourStore && expireAt),
        expireAt,
        windowMinutes,
        remainingAmount: Math.max(0, minOrder - cartSubtotal),
        discountPercent: Number(runningHappyHour?.discount) || 0,
        amountProgress:
            minOrder > 0
                ? Math.min(100, (cartSubtotal / minOrder) * 100)
                : null,
    }
}
