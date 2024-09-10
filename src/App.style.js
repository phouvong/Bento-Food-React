import { styled } from '@mui/material'

export const WrapperForApp = styled('div')(({ theme, pathname }) => ({
    direction: theme.direction,
    backgroundColor: pathname !== '/maintenance' && theme.palette.neutral[1800],
}))
