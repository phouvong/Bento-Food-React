import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import { CouponCard } from './restaurant-details.style'

// Figma node 515:91108 ("Tag") — the coupon-card-style badge for an
// already-active Pro member's offer. Reuses CouponCard's own `pro` variant
// (same bg/border/radius/padding the discount and free-delivery cards use)
// so it sits in the same row as those cards, not as a full-width banner.
const ProOfferCoupon = ({ heading, body }) => {
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
        <CouponCard variant="pro" sx={{ cursor: 'default' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.25}
                    sx={{
                        height: 20,
                        px: '4px',
                        py: '2px',
                        borderRadius: '9999px',
                        backgroundColor: theme.palette.background.paper,
                        flexShrink: 0,
                    }}
                >
                    <StarRoundedIcon
                        sx={{ fontSize: 12, color: '#F0C048' }}
                    />
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#3979E0',
                            lineHeight: 1.2,
                            letterSpacing: '-0.42px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Pro
                    </Typography>
                </Stack>
                <Typography
                    sx={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: isDark ? theme.palette.text.primary : '#303030',
                        lineHeight: 1.1,
                        letterSpacing: '-0.48px',
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {heading}
                </Typography>
            </Stack>
            <Typography
                sx={{
                    fontSize: '12px',
                    color: isDark ? theme.palette.text.secondary : '#757575',
                    lineHeight: 1.3,
                }}
            >
                {body}
            </Typography>
        </CouponCard>
    )
}

export default ProOfferCoupon
