import { alpha, styled, TextField } from '@mui/material'

export const CustomTextFieldStyle = styled(TextField)(
    ({ theme, borderColor, languageDirection, height }) => ({
        border: borderColor && `1px solid ${borderColor}`,
        borderRadius: borderColor && '10px',

        '& .MuiOutlinedInput-root': {
            flexDirection:
                languageDirection && languageDirection === 'rtl'
                    ? 'row-reverse'
                    : 'row',
            borderRadius: '4px',
            backgroundColor: theme.palette.neutral[100],
        },
        '& .MuiInputBase-root': {
            height: height ?? 45,
            fontSize: '13px',
            fontWeight: 400,
        },
        '& .MuiInputLabel-root': {
            fontSize: '14px',
        },
        '& .MuiOutlinedInput-input': {
            fontSize: '12px',
            fontWeight: 400,
            '&::placeholder': {
                color: alpha(theme.palette.neutral[400], 0.7),
            },
        },
    })
)
