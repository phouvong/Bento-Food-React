import React from 'react'
import PropTypes from 'prop-types'
import { CustomBoxFullWidth } from '@/styled-components/CustomStyles.style'
import {
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
} from '@mui/material'
import FormHelperText from '@mui/material/FormHelperText'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { alpha } from '@mui/material'

const CustomSelectWithFormik = (props) => {
    const {
        inputLabel,
        selectFieldData,
        passSelectedValue,
        touched,
        errors,
        fieldProps,
        required,
        value,
        height,
        borderRadius,
        background,
        startIcon,
        fieldSetGap, // Will add this to InputLabel
    } = props

    const [age, setAge] = React.useState(value)
    const theme = useTheme()
    const { t } = useTranslation()

    const handleChange = (event) => {
        passSelectedValue(event.target.value)
        setAge(event.target.value)
    }

    return (
        <>
            <CustomBoxFullWidth>
                <FormControl
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '& fieldset>legend': {
                                fontSize: fieldSetGap ? fieldSetGap : null, //or whatever works for you
                            },
                        },
                    }}
                    fullWidth
                >
                    <InputLabel
                        required={required}
                        id="demo-simple-select-label"
                        sx={{
                            color: theme.palette.neutral[1000],
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px', // Reduce gap for icon and label
                            marginBottom: '2px', // Optional: Fine-tune spacing
                        }}
                    >
                        {inputLabel}
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        label={inputLabel}
                        onChange={handleChange}
                        error={Boolean(touched && errors)}
                        {...fieldProps}
                        sx={{
                            height: height ?? 'inherit',
                            borderRadius: borderRadius ?? '5px',
                            background: background,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset>legend': {
                                    fontSize: '2px', //or whatever works for you
                                },
                            },
                        }}
                        input={
                            <OutlinedInput
                                sx={{}}
                                label={inputLabel} // Ensu
                                startAdornment={
                                    startIcon && (
                                        <InputAdornment position="start">
                                            {startIcon}
                                        </InputAdornment>
                                    )
                                }
                            />
                        }
                    >
                        {selectFieldData?.length > 0 &&
                            selectFieldData.map((item, index) => (
                                <MenuItem
                                    key={index}
                                    value={item.value}
                                    sx={{
                                        maxWidth: '100%',
                                        fontSize: '13px',
                                        '&:hover': {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.6
                                            ),
                                        },
                                    }}
                                >
                                    {t(item.label)}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </CustomBoxFullWidth>
            {touched && errors && !value && (
                <FormHelperText sx={{ color: theme.palette.error.main }}>
                    {t('Please select an option.')}
                </FormHelperText>
            )}
        </>
    )
}

CustomSelectWithFormik.propTypes = {
    inputLabel: PropTypes.string.isRequired,
    selectFieldData: PropTypes.array.isRequired,
    passSelectedValue: PropTypes.func.isRequired,
    startIcon: PropTypes.node, // Icon to display in InputLabel
}

export default CustomSelectWithFormik
