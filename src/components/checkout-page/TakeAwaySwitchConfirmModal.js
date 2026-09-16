import React from 'react'
import {
    Box,
    Dialog,
    Drawer,
    IconButton,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'

const TakeAwaySwitchConfirmModal = ({ open, onConfirm, onCancel }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    useCloseOnBackButton(isMobile && Boolean(open), onCancel)

    const content = (
        <Stack sx={{ width: '100%', position: 'relative', py: '18px' }}>
            <IconButton
                onClick={onConfirm}
                sx={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '28px',
                    height: '28px',
                    backgroundColor: (theme) => theme.palette.neutral[1800],
                }}
            >
                <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <Stack
                sx={{
                    gap: '20px',
                    pt: '32px',
                    pb: '8px',
                    px: '24px',
                }}
            >
                <Stack sx={{ gap: '16px', pb: '12px' }}>
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.54px',
                            color: 'text.primary',
                            textAlign: 'center',
                            px: '20px',
                        }}
                    >
                        {t('Pickup from Restaurant')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            lineHeight: 1.3,
                            color: 'text.secondary',
                            textAlign: 'center',
                        }}
                    >
                        {t(
                            'You have selected Takeaway for this order. Home Delivery is not available for takeaway orders. Please collect your order directly from the restaurant once it is ready for pickup'
                        )}
                    </Typography>
                </Stack>
            </Stack>
            <Stack
                sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px',
                    px: '24px',
                    pb: '32px',
                }}
            >
                <Box
                    onClick={onConfirm}
                    sx={{
                        width: { xs: '276px', sm: 'auto' },
                        maxWidth: '100%',
                        flex: { sm: 1 },
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        backgroundColor: 'primary.main',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.48px',
                            color: '#fff',
                            textTransform: 'capitalize',
                        }}
                    >
                        {t('Okay, Got It.')}
                    </Typography>
                </Box>
                <Box
                    onClick={onCancel}
                    sx={{
                        width: { xs: '276px', sm: 'auto' },
                        maxWidth: '100%',
                        flex: { sm: 1 },
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        backgroundColor: (theme) => theme.palette.neutral[200],
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '16px',
                            fontWeight: 700,
                            letterSpacing: '-0.48px',
                            color: 'text.primary',
                            textTransform: 'capitalize',
                        }}
                    >
                        {t('Change to Home Delivery')}
                    </Typography>
                </Box>
            </Stack>
        </Stack>
    )

    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={Boolean(open)}
                onClose={onConfirm}
                sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                    },
                }}
            >
                {content}
            </Drawer>
        )
    }

    return (
        <Dialog
            open={Boolean(open)}
            onClose={onConfirm}
            PaperProps={{
                sx: { borderRadius: '20px', width: '500px', maxWidth: '92vw' },
            }}
        >
            {content}
        </Dialog>
    )
}

export default TakeAwaySwitchConfirmModal
