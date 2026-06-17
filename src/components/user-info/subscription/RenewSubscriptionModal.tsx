import React from 'react'
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded'

interface RenewSubscriptionModalProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    t: (key: string) => string
    isWorking?: boolean
    // Overrides the default body copy. Used for the auto-triggered
    // "plan expired" variant; manual Renew button leaves it unset and
    // falls back to the original message.
    description?: string
}

const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({
    open,
    onClose,
    onConfirm,
    t,
    isWorking,
    description,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    overflow: 'visible',
                },
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    size="small"
                    aria-label={t('Close')}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1,
                        color: 'text.secondary',
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'dark'
                                ? '#374151'
                                : '#F3F4F6',
                        p: 0.5,
                        '&:hover': {
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? '#4B5563'
                                    : '#E5E7EB',
                        },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>

                <DialogContent sx={{ px: 4, py: 4 }}>
                    <Stack alignItems="center" spacing={1.5}>
                        <NotificationsActiveRoundedIcon
                            htmlColor="#F5B400"
                            sx={{ fontSize: 56 }}
                        />
                        <Typography
                            sx={{
                                fontSize: '20px',
                                fontWeight: 700,
                                color: 'text.primary',
                                textAlign: 'center',
                            }}
                        >
                            {t('Renew Your Subscription')}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'text.secondary',
                                textAlign: 'center',
                                px: 1,
                            }}
                        >
                            {description ??
                                t(
                                    ' Renew now to continue enjoying exclusive benefits and savings.'
                                )}
                        </Typography>
                        <Button
                            variant="contained"
                            disableElevation
                            disabled={isWorking}
                            onClick={onConfirm}
                            sx={{
                                mt: 1,
                                backgroundColor: 'primary.main',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '14px',
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                            }}
                        >
                            {t('Renew Subscription')}
                        </Button>
                    </Stack>
                </DialogContent>
            </Box>
        </Dialog>
    )
}

export default RenewSubscriptionModal
