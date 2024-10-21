import React from 'react'
import { alpha, Stack, Typography } from '@mui/material'
import { t } from 'i18next'
import { useTheme } from '@mui/styles'

const Line = () => {
    const theme = useTheme()
    return (
        <Stack
            position="relative"
            width={{ xs: '100%', sm: '100%', md: '2px' }}
            height={{ xs: '2px', sm: '2p', md: '300px' }}
            backgroundColor={alpha(theme.palette.neutral[400], 0.5)}
            marginInline={{ xs: '0px', sm: '0px', md: '14px' }}
        >
            <Stack
                position="absolute"
                minWidth="max-content"
                top="50%"
                left="50%"
                sx={{
                    transform: 'rotate(-90deg) translate(-50%, -50%)',
                    paddingInline: '12px',
                    transformOrigin: '0% 0%',
                    backgroundColor: theme.palette.background.paper,
                    [theme.breakpoints.down('md')]: {
                        transform: 'rotate(0deg) translate(-50%, -50%)',
                    },
                }}
            >
                <Typography
                    fontSize="14px"
                    color={(theme) => theme.palette.neutral[400]}
                >
                    {t('Or Login with')}
                </Typography>
            </Stack>
        </Stack>
    )
}

export default Line
