import { styled } from '@mui/material/styles'
import { Box, Button } from '@mui/material'

import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'

export const ButtonBox = styled(Box)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        display: 'flex',
        justifyContent: 'end',
    },
}))

export const CustomDivWithBorder = styled(CustomStackFullWidth)(
    ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '12px',
    })
)

export const LabelButton = styled(Button)(({ theme, value, selected }) => ({
    color:
        value === selected
            ? `${theme.palette.primary.main} !important`
            : `${theme.palette.neutral[400]} !important`,
    border:
        value === selected
            ? `1px solid ${theme.palette.primary.main}`
            : `1px solid ${theme.palette.neutral[400]}`,
    '&:hover': {
        border: `1px solid ${theme.palette.primary.main} !important`,
    },
}))
