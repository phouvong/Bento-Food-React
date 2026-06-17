import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

// Palette cast: the project's MUI theme exposes a custom `neutral` palette
// extension that isn't part of MUI's default Theme type. Casting at the use
// site (here) avoids forcing a global theme augmentation.
type NeutralPalette = Record<string, Record<number, string>>

interface CartHeaderProps {
    itemCount: number
    onClose: () => void
    t: (key: string) => string
}

const CartHeader: React.FC<CartHeaderProps> = ({ itemCount, onClose, t }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                px: 2,
                pt: 2,
                pb: 1.5,
                textAlign: 'center',
            }}
        >
            <Typography
                component="div"
                fontSize="18px"
                fontWeight={600}
            >
                <Typography
                    component="span"
                    fontSize="18px"
                    fontWeight={700}
                    color="primary"
                >
                    {itemCount} {t('Items')}
                </Typography>{' '}
                {t('in your cart')}
            </Typography>
            <IconButton
                aria-label={t('Close cart')}
                onClick={onClose}
                size="small"
                sx={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: (theme) =>
                        (theme.palette as unknown as NeutralPalette).neutral[200],
                    '&:hover': {
                        backgroundColor: (theme) =>
                            (theme.palette as unknown as NeutralPalette).neutral[300],
                    },
                }}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </Box>
    )
}

export default CartHeader
