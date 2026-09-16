import { Fragment, useEffect, useState } from 'react'
import { Box, Typography, styled } from '@mui/material'

const Container = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'flushBottom',
})(({ theme, flushBottom }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    width: '100%',
    backgroundColor: theme.palette.progressOffer.bg,
    borderRadius: flushBottom ? '16px 16px 0 0' : '16px',
    paddingLeft: '16px',
    paddingRight: '12px',
    paddingTop: '12px',
    paddingBottom: '12px',
    [theme.breakpoints.down('sm')]: {
        gap: '12px',
        paddingLeft: '12px',
        paddingRight: '10px',
    },
}))

const TextColumn = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
}))

const MessageRow = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    width: '100%',
}))

const IconBox = styled(Box)(({ theme }) => ({
    width: '16px',
    height: '16px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
    '& i': {
        fontSize: '16px',
        color: theme.palette.progressOffer.fill,
        display: 'block',
    },
}))

const MessageText = styled(Typography)(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.42px',
    color: theme.palette.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    '& strong': {
        fontWeight: 600,
    },
}))

const Track = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '3px',
    backgroundColor: theme.palette.progressOffer.track,
    borderRadius: '12px',
    overflow: 'hidden',
}))

const Fill = styled(Box)(({ theme, progress }) => ({
    height: '100%',
    width: `${progress}%`,
    backgroundColor: theme.palette.progressOffer.fill,
    borderRadius: '12px',
    transition: 'width 1s linear',
}))

const shouldForwardTight = (prop) => prop !== 'tight'

const TimerChip = styled(Box, { shouldForwardProp: shouldForwardTight })(
    ({ theme, tight }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
        backgroundColor: theme.palette.progressOffer.chip,
        borderRadius: '6px',
        padding: '6px',
        [theme.breakpoints.down('sm')]: {
            padding: tight ? '4px 6px' : '6px',
        },
    })
)

const TimerText = styled(Typography, { shouldForwardProp: shouldForwardTight })(
    ({ theme, tight }) => ({
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: '-0.42px',
        color: 'rgba(255, 255, 255, 0.95)',
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum"',
        whiteSpace: 'nowrap',
        [theme.breakpoints.down('sm')]: {
            fontSize: tight ? '11px' : '14px',
        },
    })
)

const pad = (value) => String(value).padStart(2, '0')

const ProgressBarTimer = ({
    expireAt,
    durationInMinutes,
    progress: progressOverride = null,
    showProgress = true,
    flushBottom = false,
    hideTimer = false,
    children,
}) => {
    const [remaining, setRemaining] = useState(0)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        if (!expireAt) return

        const totalSeconds = durationInMinutes * 60
        setTotal(totalSeconds)

        const calcRemaining = () => {
            const diff = Math.max(
                0,
                Math.floor((new Date(expireAt).getTime() - Date.now()) / 1000)
            )
            setRemaining(diff)
            return diff
        }

        calcRemaining()
        const interval = setInterval(() => {
            const rem = calcRemaining()
            if (rem <= 0) clearInterval(interval)
        }, 1000)

        return () => clearInterval(interval)
    }, [expireAt, durationInMinutes])

    const timeProgress = total > 0 ? ((total - remaining) / total) * 100 : 0
    const progress =
        progressOverride === null || progressOverride === undefined
            ? timeProgress
            : Math.min(100, Math.max(0, progressOverride))

    const days = Math.floor(remaining / 86400)
    const hours = Math.floor((remaining % 86400) / 3600)
    const minutes = Math.floor((remaining % 3600) / 60)
    const seconds = remaining % 60

    const showDays = days > 0
    const showHours = showDays || hours > 0
    const timerSegments = [
        ...(showDays ? [pad(days)] : []),
        ...(showHours ? [pad(hours)] : []),
        pad(minutes),
        pad(seconds),
    ]
    const tight = timerSegments.length > 2

    if (!expireAt && !hideTimer) return null

    return (
        <Container flushBottom={flushBottom}>
            <TextColumn>
                <MessageRow>
                    <IconBox>
                        <i className="fi fi-ss-badge-percent" />
                    </IconBox>
                    {children && <MessageText>{children}</MessageText>}
                </MessageRow>
                {showProgress && (
                    <Track>
                        <Fill progress={progress} />
                    </Track>
                )}
            </TextColumn>

            {!hideTimer && (
                <TimerChip tight={tight}>
                    <TimerText tight={tight}>
                        {timerSegments.map((segment, index) => (
                            <Fragment key={index}>
                                {index > 0 && ' : '}
                                {segment}
                            </Fragment>
                        ))}
                    </TimerText>
                </TimerChip>
            )}
        </Container>
    )
}

export default ProgressBarTimer
