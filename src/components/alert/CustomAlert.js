import React from 'react'
import { Alert } from '@mui/material'

const CustomAlert = (props) => {
    const { type, text } = props
    return (
        <Alert severity={type} sx={{ textTransform: 'none' }}>
            {text}
        </Alert>
    )
}

export default CustomAlert
