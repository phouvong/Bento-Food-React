import React from 'react'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const CustomDivider = ({ phone, children, marginTop, divider, type }) => {
    const theme = useTheme()
    return (
        <Stack
            width="100%"
            sx={{
                borderBottom: `${divider ?? '1.5px'} ${type ? type : 'solid'} ${
                    theme.palette.neutral[300]
                }`,
            }}
        ></Stack>
    )
}
export default CustomDivider
