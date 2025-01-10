import { styled } from '@mui/material/styles'
import { Button } from '@mui/material'
import Typography from '@mui/material/Typography'

export const CustomDownloadButtonStyled = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.neutral[300],
    color: theme.palette.neutral[900],
}))

export const CustomTypography = styled(Typography)(
    ({ theme, fontWeight, align }) => ({
        color: theme.palette.neutral[1000],
        fontWeight: fontWeight ? fontWeight : 'inherit',
        textAlign: align ? align : '',
    })
)
