import React from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'

interface ProPlanTopBannerProps {
    // `t` is intentionally minimal — only the keys we actually translate. Keeps
    // the contract narrow so callers don't have to widen TFunction.
    t: (key: string) => string
    // Optional: omit to hide the Subscribe CTA (e.g. when the viewer is
    // already a Pro member with an active offer).
    onSubscribe?: () => void
    // Optional override for the lead-in text rendered before the bolded
    // "Pro Plan" suffix. Defaults to the standard subscribe-prompt copy.
    messageKey?: string
    // Optional pre-formatted message. When provided, it is appended after an
    // em dash — use for active-offer text like "10% off as a Pro member" that
    // already includes its own framing.
    message?: string
}

const BANNER_BLUE = '#5266D0'
const TROPHY_GOLD = '#F0C048'

const ProPlanTopBanner: React.FC<ProPlanTopBannerProps> = ({
    t,
    onSubscribe,
    messageKey = 'Enjoy extra savings on every order with a ',
    message,
}) => {
    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: '16px',
                px: { xs: 2, sm: 2.5 },
                py: 1,
                backgroundColor: BANNER_BLUE,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
            >
                <Stack direction="row" alignItems="center" spacing={1.75}>
                    <Box
                        sx={{
                            width: { xs: 40, sm: 48 },
                            height: { xs: 40, sm: 48 },
                            borderRadius: '50%',
                            backgroundColor: TROPHY_GOLD,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <EmojiEventsRoundedIcon
                            sx={{ color: '#fff', fontSize: { xs: 22, sm: 26 } }}
                        />
                    </Box>
                    <Typography
                        sx={{
                            fontSize: { xs: '14px', sm: '16px' },
                            color: '#fff',
                            lineHeight: 1.5,
                        }}
                    >
                        {t(messageKey)}{' '}
                        <Box
                            component="span"
                            sx={{ fontWeight: 700, fontStyle: 'italic' }}
                        >
                            {t('Pro Plan')}
                        </Box>
                        {message ? <>{' — '}{message}</> : null}
                    </Typography>
                </Stack>
                {onSubscribe && (
                    <Button
                        onClick={onSubscribe}
                        variant="contained"
                        size="small"
                        sx={{
                            flexShrink: 0,
                            backgroundColor: '#fff',
                            color: BANNER_BLUE,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: '999px',
                            px: 2,
                            py: 0.5,
                            '&:hover': { backgroundColor: '#F0F1FA' },
                        }}
                    >
                        {t('Subscribe')}
                    </Button>
                )}
            </Stack>
        </Box>
    )
}

export default ProPlanTopBanner
