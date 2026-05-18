import React from 'react'
import CheckIcon from '@mui/icons-material/Check'
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
        backgroundColor,
        bgColor,
        startIcon,
        fieldSetGap, // Will add this to InputLabel
        placeholder,
    } = props

    const [age, setAge] = React.useState(value)
    const theme = useTheme()
    const { t } = useTranslation()
    const isRtl =
        typeof window !== 'undefined'
            ? localStorage.getItem('direction') === 'rtl'
            : false

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
                        displayEmpty
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
                            background: backgroundColor || bgColor || background,
                            '& .MuiSelect-icon': {
                                right: isRtl ? 'auto !important' : '12px !important',
                                left: isRtl ? '12px !important' : 'auto !important',
                            },
                            '& .MuiOutlinedInput-root': {
                                fontSize: '12px',
                                '& fieldset>legend': {
                                    fontSize: '2px', //or whatever works for you
                                },
                            },
                            '& .MuiSelect-select': {
                                paddingInlineStart: isRtl
                                    ? '36px !important'
                                    : '14px',
                                paddingInlineEnd: isRtl
                                    ? '42px !important'
                                    : '36px !important',
                            },
                            '& .MuiInputBase-input': {
                                fontSize: '13px',
                                color: theme.palette.neutral[1000],
                                fontWeight: '400',
                            },
                        }}
                        renderValue={(selected) => {
                            if (
                                (!selected || selected.length === 0) &&
                                placeholder
                            ) {
                                return (
                                    <span
                                        style={{
                                            color: theme.palette.neutral[400],
                                            fontSize: '13px',
                                        }}
                                    >
                                        {t(placeholder)}
                                    </span>
                                )
                            }
                            const selectedOption = selectFieldData?.find(
                                (item) => item.value === selected
                            )
                            return selectedOption
                                ? t(selectedOption.label)
                                : selected
                        }}
                        input={
                            <OutlinedInput
                                sx={{
                                    '& .MuiInputAdornment-positionStart': {
                                        marginInlineStart: 0,
                                        marginInlineEnd: '8px',
                                    },
                                    '& .MuiInputAdornment-positionEnd': {
                                        marginInlineStart: '8px',
                                        marginInlineEnd: 0,
                                    },
                                }}
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
                                        fontSize: '14px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        textTransform: 'capitalize',
                                        '&:hover': {
                                            backgroundColor: alpha(
                                                theme.palette.primary.main,
                                                0.6
                                            ),
                                        },
                                        // '&:not(.Mui-selected):hover': {
                                        //     backgroundColor: 'primary.main',
                                        //     color: '#fff',
                                        // },
                                        '&:not(.Mui-selected) > svg': {
                                            display: 'none',
                                        },
                                    }}
                                >
                                    {t(item.label)}
                                    <CheckIcon
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontSize: '20px',
                                            ml: 1,
                                        }}
                                    />
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
    placeholder: PropTypes.string,
    backgroundColor: PropTypes.string,
    bgColor: PropTypes.string,
}

export default CustomSelectWithFormik
