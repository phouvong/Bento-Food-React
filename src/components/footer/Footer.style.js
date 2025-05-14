import { Box, styled } from '@mui/material'
export const StyledFooterBackground = styled(Box)(({ theme, router }) => ({
    width: '100%',
    backgroundColor: '#141313',
    [theme.breakpoints.down('md')]: {
        marginBottom: router !== '/' && '4.5rem',
    },
}))
