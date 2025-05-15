import React, { useState } from 'react'
import { CustomTextFieldStyle } from './CustomTextField.style'
import { InputAdornment, Typography } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import { CustomTextFieldContainer } from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/styles'

const CustomTextFieldWithFormik = (props) => {
    const {
        label,
        type,
        required,
        touched,
        errors,
        value,
        fieldProps,
        startIcon,
        multiline,
        onChangeHandler,
        rows,
        borderRadius,
        disabled,
        languageDirection,
        height,
        placeholder,
        fieldsetGap,
    } = props
    const [inputValue, setInputValue] = useState(value)
    const [showPassword, setShowPassword] = useState(false)
    const theme = useTheme()
    const onChangeHandlerForField = (e) => {
        setInputValue(e.target.value)
    }
    const onBlurHandler = () => {
        onChangeHandler(inputValue)
    }

    const renderHandler = () => {
        if (type === 'password') {
            return (
                <CustomTextFieldContainer>
                    <CustomTextFieldStyle
                        height={height}
                        borderRadius={borderRadius}
                        languageDirection={languageDirection}
                        disabled={disabled}
                        fullWidth
                        multiline={multiline}
                        rows={rows ? rows : 4}
                        label={label}
                        name={label}
                        required={required}
                        // error={Boolean(touched && errors)}
                        // helperText={touched && errors}
                        value={inputValue}
                        onChange={onChangeHandlerForField}
                        onBlur={onBlurHandler}
                        type={showPassword ? 'text' : type}
                        InputProps={{
                            startAdornment: startIcon,
                            style: {
                                borderRadius: borderRadius,
                                height: '45px', // Set your desired height value here
                            },

                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() =>
                                            setShowPassword(
                                                (prevState) => !prevState
                                            )
                                        }
                                    >
                                        {showPassword ? (
                                            <Visibility />
                                        ) : (
                                            <VisibilityOff />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        {...fieldProps}
                    />
                    {Boolean(touched && errors) && (
                        <Typography
                            sx={{
                                fontSize: '12px',
                                color: (theme) => theme.palette.error.main,
                            }}
                        >
                            {touched && errors}
                        </Typography>
                    )}
                </CustomTextFieldContainer>
            )
        } else {
            return (
                <CustomTextFieldContainer>
                    <CustomTextFieldStyle
                        placeholder={placeholder}
                        height={height}
                        borderRadius={borderRadius}
                        disabled={disabled}
                        fullWidth
                        multiline={multiline}
                        rows={rows ? rows : 6}
                        label={label}
                        name={label}
                        required={required}
                        value={inputValue}
                        onChange={onChangeHandlerForField}
                        onBlur={onBlurHandler}
                        type={type}
                        InputProps={{
                            startAdornment: startIcon,
                            inputProps: { min: 0 },
                            style: {
                                borderRadius: borderRadius,
                                height: '45px', // Set your desired height value here
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset>legend': {
                                    fontSize: fieldsetGap && fieldsetGap, //or whatever works for you
                                },
                            },
                        }}
                        {...fieldProps}
                    />
                    {Boolean(touched && errors) && (
                        <Typography
                            sx={{
                                fontSize: '12px',
                                color: (theme) => theme.palette.error.main,
                            }}
                        >
                            {touched && errors}
                        </Typography>
                    )}
                </CustomTextFieldContainer>
            )
        }
    }
    return <Box sx={{ width: '100%', height: '60px' }}>{renderHandler()}</Box>
}

export default CustomTextFieldWithFormik
