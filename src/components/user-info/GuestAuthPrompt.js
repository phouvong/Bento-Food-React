import React from 'react'
import { Box, Button, Stack, Typography, alpha, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import { openAuthModal } from '@/redux/slices/authModal'

const GuestAuthPrompt = () => {
    const theme = useTheme()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <CustomPaperBigCard
            padding={isXSmall ? '1rem' : '30px 40px'}
            sx={{ minHeight: !isXSmall ? '558px' : '450px' }}
        >
            <Stack
                alignItems="center"
                justifyContent="center"
                spacing={2}
                sx={{ height: '100%', minHeight: 'inherit', textAlign: 'center' }}
            >
                <Box
                    sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                    }}
                >
                    <Box
                        component="i"
                        className="fi fi-rr-lock"
                        sx={{ fontSize: 28, lineHeight: 1, display: 'flex' }}
                    />
                </Box>
                <Stack spacing={0.75} alignItems="center">
                    <Typography
                        sx={{
                            fontSize: { xs: '18px', md: '20px' },
                            fontWeight: 700,
                            color: theme.palette.neutral[1000],
                        }}
                    >
                        {t('Login to avail this feature')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            maxWidth: '380px',
                            color: theme.palette.neutral[600],
                        }}
                    >
                        {t(
                            'Log in or create an account to access this section.'
                        )}
                    </Typography>
                </Stack>
                <Button
                    variant="contained"
                    onClick={() => dispatch(openAuthModal())}
                    sx={{
                        borderRadius: '8px',
                        px: 4,
                        py: 1,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                    }}
                >
                    {t('Login/Signup')}
                </Button>
            </Stack>
        </CustomPaperBigCard>
    )
}

export default GuestAuthPrompt
