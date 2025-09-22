import { styled } from '@mui/material/styles'
import { Stack } from '@mui/material'

export const CustomStackForFoodModal = styled(Stack)(({ theme, padding }) => ({
    padding: padding ? padding : '18px',
    position: 'absolute',
    bottom: '0',
    borderRadius: '0 0 8px 8px',
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(18 18 18 / 94%) 100%)`,
}))
