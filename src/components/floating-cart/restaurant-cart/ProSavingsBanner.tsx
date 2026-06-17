import React from 'react'
import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import crown from '../../../../public/static/profile/crown.svg'
import { getAmount } from '@/utils/customFunctions'

interface ProSavingsBannerProps {
    // amount is optional because some benefit types (delivery_fee, coupon)
    // surface as a verbatim message instead of a computed savings amount.
    amount?: number
    // When provided, the banner shows `message` instead of the templated
    // "You saved X as a Pro member" line.
    message?: string
    currencySymbol?: string
    currencySymbolDirection?: string
    digitAfterDecimalPoint?: number
    t: (key: string) => string
    // Optional sx override — merged after the banner's own styles so callers
    // can adjust positioning (e.g. mx: 0 for left-alignment in OrderDetails).
    sx?: SxProps<Theme>
}

const ProSavingsBanner: React.FC<ProSavingsBannerProps> = ({
    amount,
    message,
    currencySymbol,
    currencySymbolDirection,
    digitAfterDecimalPoint,
    t,
    sx,
}) => {
    const formattedAmount =
        amount !== undefined
            ? getAmount(
                  amount,
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )
            : ''

    return (
        <Box
            sx={[
                {
                    mx: 2,
                    mt: 1.5,
                    mb: 1.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: '5px',
                    background:
                        'linear-gradient(90deg, #A78BFA 0%, #8B5CF6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                },
                ...(Array.isArray(sx) ? sx : [sx]),
            ]}
        >
            {/* The crown asset is filled with light purple — invisible on
                the purple gradient. We render it as a mask and color it via
                backgroundColor (yellow, matching the prior trophy icon). */}
            <Box
                sx={{
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                    backgroundColor: '#FACC15',
                    WebkitMaskImage: `url(${crown.src})`,
                    maskImage: `url(${crown.src})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                }}
            />
            <Typography
                sx={{
                    flex: 1,
                    fontSize: '13px',
                    color: '#fff',
                    lineHeight: 1.35,
                }}
            >
                {message
                    ? message
                    : `${t('You saved')} ${formattedAmount} ${t(
                          'as a Pro member.'
                      )}`}
            </Typography>
        </Box>
    )
}

export default ProSavingsBanner
