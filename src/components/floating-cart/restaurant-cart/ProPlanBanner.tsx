import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'

interface ProPlanBannerProps {
    onSubscribe?: () => void
    t: (key: string) => string
    // Optional override for the lead-in text rendered before the bolded
    // "Pro Plan" phrase. Defaults to the standard subscribe-prompt copy.
    messageKey?: string
    // Text after the bolded "Pro Plan" phrase.
    suffixKey?: string
}

// Blue promo banner — crown badge, "Use Pro Plan to get extra savings in
// every order." copy and an "Explore ›" call to action.
const ProPlanBanner: React.FC<ProPlanBannerProps> = ({
    onSubscribe,
    t,
    messageKey = 'Use',
    suffixKey = 'to get extra savings in every order.',
}) => {
    return (
        <Box
            sx={{
                mx: 2,
                my: 1.5,
                px: 1.75,
                py: 1.5,
                borderRadius: '12px',
                backgroundColor: '#3D6CE7',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
            }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F5C842',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <EmojiEventsRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </Box>
            <Typography
                sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: '13px',
                    color: '#fff',
                    lineHeight: 1.4,
                }}
            >
                {t(messageKey)}{' '}
                <Box
                    component="span"
                    sx={{ fontWeight: 700, fontStyle: 'italic' }}
                >
                    {t('Pro Plan')}
                </Box>
                {suffixKey ? <> {t(suffixKey)}</> : null}
            </Typography>
            {onSubscribe && (
                <Stack
                    direction="row"
                    alignItems="center"
                    onClick={onSubscribe}
                    sx={{
                        flexShrink: 0,
                        cursor: 'pointer',
                        userSelect: 'none',
                        '&:hover': { opacity: 0.85 },
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#fff',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {t('Explore')}
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 18, color: '#fff' }} />
                </Stack>
            )}
        </Box>
    )
}

export default ProPlanBanner
