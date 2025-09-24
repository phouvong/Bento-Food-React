import { Rating } from '@mui/material'
import { styled } from '@mui/material/styles'

export const CustomRating = styled(Rating)(
    ({ theme, color, borderColor, fontSize }) => ({
        color: color ? color : theme.palette.primary.main,
        borderColor: borderColor || theme.palette.primary.main,
        fontSize: fontSize || '',
        '& .MuiSvgIcon-root': {
            fill: color ? color : (theme) => theme.palette.primary.main,
        },
        [theme.breakpoints.down('md')]: {
            // styles
            fontSize: '1rem',
        },
    })
)
