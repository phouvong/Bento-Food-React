import { alpha, Paper, styled, Stack } from '@mui/material'

export const FeatureImageBox = styled(Stack)(({ theme }) => ({
    width: '100%',
    paddingTop: '10px',
    borderRadius: '32px',
    [theme.breakpoints.down('md')]: {
        paddingTop: '2px',
    },
}))
