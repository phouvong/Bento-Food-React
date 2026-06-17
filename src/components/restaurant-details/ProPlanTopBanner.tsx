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
    // Optional pre-formatted message. When provided, replaces the entire
    // "messageKey + Pro Plan" rendering — use for active-offer text like
    // "10% off as a Pro member" that already includes its own framing.
    message?: string
}

// Decorative wave overlay on the right half of the banner. Inline SVG so the
// banner has zero extra asset dependencies and renders crisp at any width.
const WaveDecoration: React.FC = () => (
    <Box
        sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: { xs: '55%', sm: '50%' },
            pointerEvents: 'none',
            overflow: 'hidden',
            borderRadius: 'inherit',
        }}
    >
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 60"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: 'absolute', right: 0, top: 0 }}
        >
            <g
                stroke="#8B6FE0"
                strokeOpacity="0.55"
                strokeWidth="0.8"
                fill="none"
            >
                {/* Lines all bend at the convergence point (620, 4),
                    fanning out to the bottom-left and the right edge,
                    which produces the bowtie/fan shape in the screenshot. */}
                <path d="M 160 75 Q 420 18 620 4 Q 720 6 820 10" />
                <path d="M 195 75 Q 440 16 620 4 Q 725 9 820 14" />
                <path d="M 230 75 Q 460 14 620 4 Q 730 12 820 18" />
                <path d="M 265 75 Q 480 12 620 4 Q 735 15 820 22" />
                <path d="M 300 75 Q 500 10 620 4 Q 740 18 820 26" />
                <path d="M 335 75 Q 515 8 620 4 Q 745 21 820 30" />
                <path d="M 370 75 Q 530 7 620 4 Q 750 24 820 34" />
                <path d="M 400 75 Q 545 6 620 4 Q 755 27 820 38" />
                <path d="M 430 75 Q 560 5 620 4 Q 760 30 820 42" />
                <path d="M 460 75 Q 575 5 620 4 Q 765 33 820 46" />
                <path d="M 490 75 Q 590 4 620 4 Q 770 36 820 50" />
                <path d="M 515 75 Q 600 4 620 4 Q 775 39 820 54" />
                <path d="M 540 75 Q 610 4 620 4 Q 780 42 820 58" />
            </g>
        </svg>
    </Box>
)

const ProPlanTopBanner: React.FC<ProPlanTopBannerProps> = ({
    t,
    onSubscribe,
    messageKey = 'Enjoy extra savings on every order with a ',
    message,
}) => {
    
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                borderRadius: '10px',
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                background:
                    'linear-gradient(90deg, #ECE6FF 0%, #F4EFFF 60%, #F7F4FF 100%)',
                overflow: 'hidden',
            }}
        >
            <WaveDecoration />
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ position: 'relative' }}
            >
                <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Box
                        sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                        }}
                    >
                        <EmojiEventsRoundedIcon
                            sx={{ color: '#F5B400', fontSize: 18 }}
                        />
                    </Box>
                    <Typography
                        sx={{
                            fontSize: { xs: '13px', sm: '14px' },
                            color: '#1F2937',
                        }}
                    >
                        {t(messageKey)}{' '}
                        <Box component="span" sx={{ fontWeight: 700 }}>
                            {' '}
                            {t('Pro Plan')}
                        </Box>
                        {message ? (
                            <>
                                {' — '}
                                <Box
                                    component="span"
                                    sx={{ fontWeight: 600 }}
                                >
                                    {message}
                                </Box>
                            </>
                        ) : null}
                    </Typography>
                </Stack>
                {onSubscribe && (
                    <Button
                        onClick={onSubscribe}
                        variant="contained"
                        size="small"
                        sx={{
                            flexShrink: 0,
                            backgroundColor: '#7C3AED',
                            color: '#fff',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: '999px',
                            px: 2,
                            py: 0.5,
                            '&:hover': { backgroundColor: '#6D28D9' },
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
