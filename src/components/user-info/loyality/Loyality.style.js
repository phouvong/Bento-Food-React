import { styled, Box, Typography } from '@mui/material'

export const BoxStyle = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: 24,
    padding: '32px',
    width: '20%',
    [theme.breakpoints.down('md')]: {
        width: '80%',
    },
}))
export const CouponTypography = styled(Typography)(({ theme }) => ({
    zIndex: 999,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: theme.palette.whiteContainer.main,
    fontSize: '15px',
}))
