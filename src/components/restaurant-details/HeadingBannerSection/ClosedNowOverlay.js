import React from 'react'
import { Stack, Typography, alpha } from '@mui/material'

const ClosedNowOverlay = (props) => {
    const { t, borderRadius = '12px' } = props
    return (
        <Stack
            sx={{
                position: 'absolute',
                inset: 0,
                backgroundColor: (theme) =>
                    alpha(theme.palette.common.black, 0.55),
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: borderRadius,
                zIndex: 2,
            }}
        >
            <Typography
                align="center"
                fontWeight={700}
                sx={{
                    fontSize: '11px',
                    lineHeight: 1.2,
                    color: (theme) => theme.palette.common.white,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}
            >
                {t('Closed Now')}
            </Typography>
        </Stack>
    )
}

ClosedNowOverlay.propTypes = {}

export default ClosedNowOverlay
