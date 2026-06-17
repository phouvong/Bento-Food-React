import React from 'react'
import { Box, Typography } from '@mui/material'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'

interface ProPlanBannerProps {
    onSubscribe?: () => void
    t: (key: string) => string
    // Optional override for the lead-in text rendered before the bolded
    // "Pro Plan" suffix. Defaults to the standard subscribe-prompt copy.
    messageKey?: string
}

const ProPlanBanner: React.FC<ProPlanBannerProps> = ({
    onSubscribe,
    t,
    messageKey = 'Enjoy extra savings on every order with a',
}) => {
    return (
        <Box
            sx={{
                mx: 2,
                mt: 1.5,
                mb: 1.5,
                px: 1.5,
                py: 1.25,
                borderRadius: '12px',
                backgroundColor: '#E9DFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
            }}
        >
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <EmojiEventsRoundedIcon sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <Typography
                sx={{
                    flex: 1,
                    fontSize: '12px',
                    color: '#1F2937',
                    lineHeight: 1.35,
                }}
            >
                {t(messageKey)}{' '}
                <Box component="span" sx={{ fontWeight: 700 }}>
                    {t('Pro Plan')}
                </Box>
            </Typography>
            {onSubscribe && (
                <Typography
                    onClick={onSubscribe}
                    sx={{
                        flexShrink: 0,
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#7C3AED',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {t('Subscribe Now')}
                </Typography>
            )}
        </Box>
    )
}

export default ProPlanBanner
