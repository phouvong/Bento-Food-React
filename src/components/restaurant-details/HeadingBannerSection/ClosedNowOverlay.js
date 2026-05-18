import React from 'react'
import { Stack, Typography, alpha } from '@mui/material'

const ClosedNowOverlay = (props) => {
    const { t, theme, scrollPosition, isSmall, threshold } = props
    return (
        <Stack
            sx={{
                position: 'absolute',
                bottom: isSmall && scrollPosition <= threshold && 35,
                left: 0,
                width: '100%',
                backgroundColor: (theme) =>
                    alpha(theme.palette.common.black, 0.55),
                padding: '10px',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                zIndex: 999,
            }}
        >
            <Typography
                variant="h5"
                align="center"
                fontWeight={700}
                sx={{
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
