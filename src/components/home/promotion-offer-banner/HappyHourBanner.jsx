import { Box, Stack, Typography, styled } from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import HappyHourIcon from '@/components/happy-hour/HappyHourIcon'
import HappyHourViewModal from '@/components/happy-hour/HappyHourViewModal'
import useGetRunningHappyHour from '@/hooks/react-query/happy-hour/useGetRunningHappyHour'

const BannerShell = styled(Stack, {
    shouldForwardProp: (prop) => prop !== 'compact',
})(({ theme, compact }) => ({
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: theme.palette.happyHourBanner.bg,
    gap: '8px',
    ...(compact
        ? {
              borderRadius: '16px 16px 0 0',
              padding: '12px 12px 32px 16px',
          }
        : {
              borderRadius: '16px',
              padding: '16px 16px 16px 20px',
          }),
}))

const getRemainingTime = (expireAt) => {
    const difference = new Date(expireAt).getTime() - Date.now()

    if (difference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            expired: true,
        }
    }

    const totalSeconds = Math.floor(difference / 1000)

    return {
        days: Math.floor(totalSeconds / 86400),
        hours: Math.floor((totalSeconds % 86400) / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        expired: false,
    }
}

const pad = (value) => String(value).padStart(2, '0')

// compact: the flush, top-rounded variant used when floating above BottomNav
// on mobile (Figma node 2010:73296). Default: the full home-feed card.
const HappyHourBanner = ({ compact = false, onActiveChange }) => {
    const { t } = useTranslation()

    const { data: runningData, refetch: refetchRunning } =
        useGetRunningHappyHour()
    const happyHour = runningData?.is_running ? runningData?.happy_hour : null

    // Countdown target anchored to the server-computed remaining_seconds at
    // response time — immune to client clock / timezone drift, unlike
    // parsing `ends_at` locally.
    const [expireAt, setExpireAt] = useState(null)
    useEffect(() => {
        setExpireAt(
            happyHour?.remaining_seconds > 0
                ? Date.now() + happyHour.remaining_seconds * 1000
                : null
        )
    }, [happyHour?.id, happyHour?.remaining_seconds])

    const [openModal, setOpenModal] = useState(false)
    const [remainingTime, setRemainingTime] = useState(() =>
        getRemainingTime(expireAt)
    )

    useEffect(() => {
        if (!expireAt) return
        setRemainingTime(getRemainingTime(expireAt))

        const interval = setInterval(() => {
            const remaining = getRemainingTime(expireAt)

            setRemainingTime(remaining)

            if (remaining.expired) {
                clearInterval(interval)
                // The window just closed — ask the backend whether another
                // one opened (or hide the banner via is_running: false).
                refetchRunning()
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [expireAt])

    const { days, hours, minutes, seconds, expired } = remainingTime

    const isActive =
        Boolean(happyHour) &&
        Boolean(expireAt) &&
        !expired &&
        +happyHour?.store_count > 0

    useEffect(() => {
        onActiveChange?.(isActive)
        return () => onActiveChange?.(false)
    }, [isActive, onActiveChange])

    if (!isActive) return null

    // "25% OFF! Evening Happy Hour" — discount prefix reuses the existing
    // '% OFF' translation key.
    const bannerTitle = `${
        happyHour?.discount ? `${happyHour.discount}${t('% OFF')}! ` : ''
    }${happyHour?.title ?? t('Happy Hour')}`

    // Adapts the API payload to the modal's activeBogoItem contract; the
    // modal fetches its own store list from /happy-hour/stores.
    const modalData = {
        title: bannerTitle,
        description: happyHour?.short_description,
        expire_at: new Date(expireAt).toISOString(),
        cover_image_full_url: happyHour?.cover_image_full_url,
        min_order_amount: Number(happyHour?.min_order_amount) || 0,
        discount: Number(happyHour?.discount) || 0,
        started_at: happyHour?.started_at,
        ends_at: happyHour?.ends_at,
    }

    const showDays = days > 0
    const showHours = showDays || hours > 0
    const segments = [
        ...(showDays ? [pad(days)] : []),
        ...(showHours ? [pad(hours)] : []),
        pad(minutes),
        pad(seconds),
    ]
    const tight = compact && segments.length > 3

    // Fixed (not min-) width + tabular-nums so a digit changing width
    // (e.g. 9 -> 10) never reflows the box or shifts sibling segments.
    const timerNumberSx = {
        width: tight ? '24px' : compact ? '30px' : '36px',
        flexShrink: 0,
        textAlign: 'center',
        fontSize: tight ? '13px' : compact ? '16px' : '18px',
        fontWeight: 700,
        letterSpacing: '-0.48px',
        lineHeight: 1.1,
        padding: tight ? '4px' : compact ? '6px' : '8px',
        backgroundColor: (theme) => theme.palette.happyHourBanner.timerBg,
        borderRadius: '6px',
        color: (theme) => theme.palette.whiteContainer.main,
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
    }

    const colonSx = {
        width: tight ? '5px' : '8px',
        flexShrink: 0,
        textAlign: 'center',
        fontSize: tight ? '13px' : compact ? '16px' : '18px',
        fontWeight: 700,
        color: (theme) => theme.palette.happyHourBanner.timerColon,
    }

    const handleBannerClick = () => {
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setOpenModal(false)
    }

    return (
        <>
            <BannerShell
                compact={compact}
                role="button"
                tabIndex={0}
                onClick={handleBannerClick}
            >
                <Box
                    sx={{
                        flexShrink: 0,
                        width: '40px',
                        height: '40px',
                        '& svg': { width: '100%', height: '100%' },
                    }}
                >
                    <HappyHourIcon />
                </Box>

                <Stack sx={{ flex: 1, minWidth: 0, gap: '4px' }}>
                    <Typography
                        component="h3"
                        sx={{
                            fontSize: compact ? '16px' : '18px',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.48px',
                            color: (theme) => theme.palette.text.primary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {bannerTitle}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: compact ? '12px' : '14px',
                            lineHeight: 1.3,
                            color: (theme) =>
                                theme.palette.referBanner.subtitle,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {t('Tap to View Offers.')}
                    </Typography>
                </Stack>

                <Stack
                    direction="row"
                    sx={{
                        flexShrink: 0,
                        alignItems: 'center',
                        gap: tight ? '2px' : '4px',
                        flexWrap: 'nowrap',
                    }}
                >
                    {segments.map((value, index) => (
                        <Fragment key={index}>
                            {index > 0 && (
                                <Typography sx={colonSx}>:</Typography>
                            )}
                            <Typography sx={timerNumberSx}>{value}</Typography>
                        </Fragment>
                    ))}
                </Stack>
            </BannerShell>

            <HappyHourViewModal
                isOpenModal={openModal}
                onCloseModal={handleCloseModal}
                activeBogoItem={modalData}
            />
        </>
    )
}

export default HappyHourBanner
