import { Box, styled } from '@mui/material'
export const StyledFooterBackground = styled(Box)(({ theme, router }) => ({
    width: '100%',
    background: 'linear-gradient(180deg, #0B1020 0%, #05080F 100%)',
    color: '#CBD5E1',
    position: 'relative',
    overflow: 'hidden',
    fontSize: '13px',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: '-180px',
        left: '-180px',
        width: '480px',
        height: '480px',
        background:
            'radial-gradient(circle, rgba(255,117,24,.10) 0%, transparent 65%)',
        pointerEvents: 'none',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '60px',
        right: '-200px',
        width: '520px',
        height: '520px',
        background:
            'radial-gradient(circle, rgba(37,99,235,.06) 0%, transparent 65%)',
        pointerEvents: 'none',
    },
    [theme.breakpoints.down('md')]: {
        marginBottom: router !== '/' && '4.5rem',
    },
    marginTop:"24px"
}))
