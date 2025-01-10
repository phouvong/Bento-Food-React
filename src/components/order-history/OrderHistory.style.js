import { styled } from '@mui/material/styles'
import { Button, Grid } from '@mui/material'

export const ActiveButtion = styled(Button)(({ theme, background }) => ({
    borderRadius: '14px',
    display: 'block',
    background: background,
    color: `${theme.palette.mode === 'dark' ? '#fff' : '#000'}`,
    [theme.breakpoints.up('xs')]: {
        width: '120.12px',
    },
    [theme.breakpoints.up('md')]: {
        width: '225px',
    },
}))

export const Image = styled('img')(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        width: '42px',
    },
    [theme.breakpoints.up('md')]: {
        width: '57px',
    },
}))

export const ActiveButtonGrid = styled(Grid)(() => ({
    display: 'flex',
    justifyContent: 'end',
}))

export const ButtonGrid = styled(Grid)(() => ({
    paddingTop: '30px',
    paddingBottom: '60px',
}))

export const TrackButton = styled(Button)(({ theme }) => ({
    width: '100%',
    height: '40px',
    background: theme.palette.primary.main,
    border: '1px solid rgba(239, 120, 34, 0.3)',
    borderRadius: '5px',
    color: `${theme.palette.whiteContainer.main} !important`,
    gap: '5px',
    boxShadow:
        '0px 0px 1.81508px rgba(145, 158, 171, 0.2), 0px 9.07541px 18.1508px -2.72262px rgba(145, 158, 171, 0.05)',
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
    [theme.breakpoints.up('md')]: {
        width: '150px',
        height: '40px',
        fontSize: '16px',
    },
}))
