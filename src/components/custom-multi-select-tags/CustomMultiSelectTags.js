import React from 'react'
import { TextField, InputAdornment, Chip } from '@mui/material'
import Autocomplete from '@mui/lab/Autocomplete'
import { t } from 'i18next'
import CancelIcon from '@mui/icons-material/Cancel'

const CustomMultiSelectTags = ({
    label,
    startIcon,
    placeholder,
    options = [],
    value = [],
    onChange,
    handleDelete,
    ...fieldProps
}) => {
    return (
        <Autocomplete
            limitTags={2}
            id="multiple-limit-tags"
            multiple
            filterSelectedOptions
            options={options}
            value={value}
            isOptionEqualToValue={(option, value) =>
                option.value === value.value
            }
            getOptionLabel={(option) => option.label || ''}
            onChange={(event, selectedOptions) => {
                // Trigger the onChange prop if provided
                onChange(selectedOptions)
            }}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <>
                        <Chip
                            key={index}
                            label={option.label}
                            onDelete={() => {
                                handleDelete(option)
                            }}
                            style={{
                                marginRight: 5,
                                marginTop: 5,
                                marginBottom: 5,
                                backgroundColor: '#ddd',
                                color: '#333',
                                fontSize: '12px',
                            }}
                            deleteIcon={
                                <CancelIcon
                                    style={{
                                        margin: "0 5px 0 5px",

                                        fontSize: "20px"
                                    }}
                                />
                            }
                        />
                    </>
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={t(label)}
                    sx={{
                        '& .MuiInputBase-root': {
                            minHeight: '45px',
                            height: 'auto',
                            padding: '0px 0',
                            paddingLeft: '15px',
                        },
                        '& .MuiOutlinedInput-root': {
                            '& fieldset>legend': {
                                fontSize: '10px', //or whatever works for you
                            },
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '14px',
                        },
                        '& .MuiAutocomplete-tag': {
                            marginTop: '3px',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            fontSize: '12px', // Adjust placeholder font size
                            fontWeight: 400,
                        },
                        color: (theme) => theme.palette.neutral[1000],
                    }}
                    placeholder={placeholder}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                {startIcon && (
                                    <InputAdornment position="start">
                                        {startIcon}
                                    </InputAdornment>
                                )}
                                {params.InputProps.startAdornment}
                            </>
                        ),
                    }}
                />
            )}
            sx={{
                '& .MuiAutocomplete-inputRoot': {
                    minHeight: '45px',
                },
            }}
        />
    )
}

export default CustomMultiSelectTags
