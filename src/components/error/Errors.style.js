import { styled, Typography } from '@mui/material'

export const CustomTypographyGray = styled(Typography)(
    ({ theme, nodefaultfont, textdecoration, fontweight }) => ({
        color: theme.palette.neutral[400],
        fontWeight: fontweight ? fontweight : 'bold',
        fontSize: nodefaultfont !== 'true' && '1.75rem',
        textDecoration: textdecoration,
    })
)
