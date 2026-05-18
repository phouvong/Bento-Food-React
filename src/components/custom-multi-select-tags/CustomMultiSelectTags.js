import React from 'react'
import { TextField, InputAdornment, Chip, Checkbox } from '@mui/material'
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
    backgroundColor,
    filterSelectedOptions = true,
    getOptionDisabled,
    disableDeleteOption,
    showOptionCheckbox = false,
    disableCloseOnSelect = true,
    required,
    ...fieldProps
}) => {
    return (
        <Autocomplete
            limitTags={2}
            id="multiple-limit-tags"
            multiple
            disableClearable
            disableCloseOnSelect={disableCloseOnSelect}
            filterSelectedOptions={filterSelectedOptions}
            options={options}
            value={value}
            getOptionDisabled={getOptionDisabled}
            isOptionEqualToValue={(option, value) =>
                option.value === value.value
            }
            getOptionLabel={(option) => option.label || ''}
            onChange={(event, selectedOptions) => {
                // Trigger the onChange prop if provided
                onChange(selectedOptions)
            }}
            renderOption={
                showOptionCheckbox
                    ? (props, option, { selected }) => (
                          <li {...props}>
                              <Checkbox
                                  checked={selected}
                                  size="small"
                                  sx={{ mr: 1, p: 0.5 }}
                              />
                              <span style={{ fontSize: '12px' }}>
                                  {option.label}
                              </span>
                          </li>
                      )
                    : undefined
            }
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <>
                        <Chip
                            key={index}
                            label={option.label}
                            onDelete={
                                disableDeleteOption?.(option)
                                    ? undefined
                                    : () => {
                                          handleDelete(option)
                                      }
                            }
                            sx={{
                                marginRight: '5px',
                                marginTop: '8px',
                                marginBottom: '8px',
                                backgroundColor: '#ddd',
                                color: (theme) => theme.palette.neutral[1000],
                                fontSize: '12px',
                                fontWeight: 400,
                                '& .MuiChip-deleteIcon': {
                                    color: (theme) =>
                                        theme.palette.neutral[1000],
                                },
                            }}
                            deleteIcon={
                                disableDeleteOption?.(option) ? undefined : (
                                    <CancelIcon
                                        style={{
                                            margin: '0 5px 0 5px',
                                            fontSize: '20px',
                                        }}
                                    />
                                )
                            }
                        />
                    </>
                ))
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={t(label)}
                    required={required}
                    sx={{
                        '& .MuiInputBase-root': {
                            minHeight: '45px',
                            height: 'auto',
                            padding: '0px 0',
                            paddingLeft: '15px',
                            backgroundColor: backgroundColor || 'transparent',
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
            {...fieldProps}
        />
    )
}

export default CustomMultiSelectTags
