import React, { useState } from 'react'
import { TextField, Chip } from '@mui/material'
import { CustomTextFieldStyle } from '../form-fields/CustomTextField.style'
import { CustomTextFieldContainer } from '@/styled-components/CustomStyles.style'

const MultiSelectTypedInput = ({
    label,
    placeholder,
    height,
    borderRadius,
    disabled,
    multiline,
    rows,
    touched,
    errors,
    onBlurHandler,
    onChangeHandlerForField,
    type,
    required,
    startIcon,
    fieldProps,

    fieldName,
    selectedValues = [],
    setSelectedValues,
    formik,
    maxSelection = 5,
}) => {
    const [inputValue, setInputValue] = useState('')
    const handleInputChange = (event) => {
        setInputValue(event.target.value)
    }

    const handleKeyDown = (event) => {
        // Only add the typed value as a tag when Enter or Comma is pressed
        if (
            (event.key === 'Enter' || event.key === ',') &&
            inputValue.trim() !== ''
        ) {
            // Prevent adding if already 5 values are selected
            if (selectedValues.length < maxSelection) {
                if (!selectedValues.includes(inputValue.trim())) {
                    const newValues = [...selectedValues, inputValue.trim()]
                    formik.setFieldValue(fieldName, newValues) // Update Formik field value
                }
                setInputValue('') // Reset input field
            }
            event.preventDefault()
        }
    }

    const handleDeleteTag = (tagToDelete) => {
        const updatedValues = selectedValues.filter(
            (value) => value !== tagToDelete
        )
        formik.setFieldValue(fieldName, updatedValues) // Update Formik field value
    }

    return (
        <div>
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
                error={Boolean(touched && errors)}
                helperText={touched && errors}
                value={inputValue}
                onBlur={onBlurHandler}
                type={type}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                // InputProps={{

                //     inputProps: { min: 0 },
                // }}
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
                fontSize: '8px', //or whatever works for you
            },
        },
                }}
                {...fieldProps}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {selectedValues?.map((option, index) => (
                    <Chip
                        key={index}
                        label={option}
                        onDelete={() => handleDeleteTag(option)}
                        style={{
                            marginRight: 5,
                            marginTop: 5,
                            backgroundColor: '#ddd',
                            color: '#333',
                            fontSize: '14px',
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default MultiSelectTypedInput
