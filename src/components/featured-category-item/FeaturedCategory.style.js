import { alpha, Paper, styled, Stack } from '@mui/material'

export const FeatureImageBox = styled(Stack)(({ theme }) => ({
    width: '100%',
    paddingTop: '10px',
    borderRadius: '32px',
    transition: 'padding-top 0.3s ease, gap 0.3s ease',
    [theme.breakpoints.down('md')]: {
        paddingTop: '2px',
    },
}))
