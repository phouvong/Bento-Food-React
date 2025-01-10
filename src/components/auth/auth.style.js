import { Box, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'

export const CustomBoxForModal = styled(Box)(
    ({ theme, padding, maxWidth }) => ({
        borderRadius: '10px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: maxWidth ?? '670px',
        width: '100%',
        background: theme.palette.background.paper,
        boxShadow: 24,
        padding: padding ?? '2.8rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            width: '0.1em',
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.neutral[300],
            outline: `1px solid ${theme.palette.neutral[300]}`,
        },
        [theme.breakpoints.between('xs', 'sm')]: {
            padding: '2rem',
            maxWidth: '340px',
            minWidth: '270px',
        },
        [theme.breakpoints.down('xs')]: {
            padding: '1.5rem',
            maxWidth: '320px',
            minWidth: '200px',
        },
    })
)
export const LoginWrapper = styled(Stack)(({ theme }) => ({
    gap: '2rem',
    width: '100%',
    justifyContent: 'space-between',
}))
