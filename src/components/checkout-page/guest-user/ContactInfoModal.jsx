import React from 'react'
import {
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
import GuestUserInforForm from './GuestUserInforForm'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'

const ContactInfoModal = ({
    open,
    onClose,
    configData,
    customerData,
    additionalInformationDispatch,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    useCloseOnBackButton(isMobile && Boolean(open), onClose)

    const content = (
        <Stack sx={{ width: '100%' }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: '24px', pt: '24px' }}
            >
                <Typography
                    sx={{
                        fontSize: '18px',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.54px',
                        color: 'text.primary',
                    }}
                >
                    {t('Contact Info')}
                </Typography>
                <IconButton
                    onClick={onClose}
                    sx={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: (theme) => theme.palette.neutral[1800],
                    }}
                >
                    <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
            </Stack>
            <GuestUserInforForm
                configData={configData}
                customerData={customerData}
                additionalInformationDispatch={additionalInformationDispatch}
                handleClose={onClose}
                hideReset
                submitLabel={t('Confirm Information')}
            />
        </Stack>
    )

    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={Boolean(open)}
                onClose={onClose}
                sx={{ zIndex: (theme) => theme.zIndex.modal + 10 }}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                        maxHeight: '85vh',
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
            onClose={onClose}
            PaperProps={{
                sx: { borderRadius: '20px', width: '500px', maxWidth: '92vw' },
            }}
        >
            {content}
        </Dialog>
    )
}

export default ContactInfoModal
