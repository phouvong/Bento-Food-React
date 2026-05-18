import React from 'react'
import { Container } from '@mui/material'

// System-wide layout wrapper.
// Width is governed centrally by the theme override on MuiContainer.maxWidthLg
// (see src/theme/base-theme-options.js) — currently 1440px at min-width: 1200px.
const CustomContainer = ({ children, maxWidth = 'lg', ...props }) => {
    return (
        <Container maxWidth={maxWidth} {...props}>
            {children}
        </Container>
    )
}

export default CustomContainer
