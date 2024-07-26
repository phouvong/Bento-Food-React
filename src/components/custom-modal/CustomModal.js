import { Clear } from '@mui/icons-material'
import { Box, Modal, Stack, useMediaQuery, useTheme } from '@mui/material'
import { CustomModalWrapper } from './CustomModal.style'

const CustomModal = ({
    openModal,
    setModalOpen,
    children,
    disableAutoFocus,
    maxWidth,
    bgColor,
    closeButton,
}) => {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.up('sm'))
    const handleClose = (event, reason) => {
        if (reason && reason == 'backdropClick') {
            if (disableAutoFocus) {
                return
            } else {
                setModalOpen(false)
            }
        } else {
            setModalOpen(false)
        }
    }

    return (
        <div>
            <Modal
                open={openModal}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                disableAutoFocus={disableAutoFocus}
                backDrop
            >
                <CustomModalWrapper bgColor={bgColor} maxWidth={maxWidth}>
                    {closeButton ? (
                        <Stack direction={'row'} justifyContent={'flex-end'}>
                            <Box
                                onClick={handleClose}
                                sx={{
                                    cursor: 'pointer',
                                    color: theme.palette.text.secondary,
                                    mt: 1.7,
                                    mr: 1.7,
                                }}
                            >
                                <Clear />
                            </Box>
                        </Stack>
                    ) : (
                        ''
                    )}
                    {children}
                </CustomModalWrapper>
            </Modal>
        </div>
    )
}
CustomModal.propTypes = {}

export default CustomModal
