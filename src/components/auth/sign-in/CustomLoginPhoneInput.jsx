import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import PhoneInput from 'react-phone-input-2'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CustomTypography } from '@/components/custom-tables/Tables.style'

const useStyles = makeStyles((theme) => ({
    borderClass: ({
        theme,
        focus,
        languageDirection,
        rtlChange,
        borderradius,
    }) => ({
        '&.react-tel-input .special-label': {
            fontSize: '12px',
            fontWeight: 400,
            color: focus
                ? theme.palette.primary.main
                : theme.palette.neutral[900],
            left: languageDirection === 'rtl' ? '80%' : '10px',
            backgroundColor: theme.palette.background.paper,
            zIndex: '999',
        },
        '&.react-tel-input .country-list .country .dial-code': {
            color: theme.palette.neutral[1000],
        },
        '&.react-tel-input .form-control': {
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
            color: theme.palette.neutral[1000],
            padding:
                languageDirection === 'rtl'
                    ? '18.5px 58px 18.5px 10px'
                    : '18.5px 14px 18.5px 52px',
            ...(languageDirection === 'rtl' && {
                textAlign: 'right',
                direction: 'rtl',
                unicodeBidi: 'plaintext',
            }),
            borderRadius: borderradius ?? '5px',
            fontSize: '13px',
        },
        '&.react-tel-input .form-control:focus': {
            border: `1px solid ${theme.palette.primary.main}`,
            zIndex: 99999,
            boxShadow: 'none',
        },
        '&.react-tel-input .country-list .country-name': {
            color: theme.palette.neutral[1000],
        },
        '&.react-tel-input .selected-flag': {
            backgroundColor: theme.palette.background.paper,
            border: focus
                ? `1px solid ${theme.palette.primary.main}`
                : `1px solid ${theme.palette.divider}`,
            borderRight: 'none',
            padding:
                languageDirection === 'rtl' ? '0 25px 0 11px' : ' 0 0px 0 11px',
            borderRadius: `${borderradius ?? '3px'} 0px 0px ${
                borderradius ?? '3px'
            }`,
        },
        '&.react-tel-input .selected-flag .arrow': {
            left: languageDirection === 'rtl' ? '13px' : '29px',
        },
        '&.react-tel-input .flag-dropdown.open .selected-flag': {
            backgroundColor: 'unset',
        },
        '&.react-tel-input .country-list': {
            backgroundColor: theme.palette.background.paper,
        },
        '&.react-tel-input .country-list .search-box': {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.neutral[600],
        },
        '&.react-tel-input .country-list .search': {
            backgroundColor: theme.palette.background.paper,
        },
    }),
}))

const CustomLoginPhoneNInput = ({
    value,
    onHandleChange,
    initCountry,
    touched,
    errors,
    rtlChange,
    borderradius,
}) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const [languageDirection, setLanguageDirection] = useState('ltr')
    const [focus, setFocus] = useState(false)
    const classes = useStyles({
        theme,
        focus,
        languageDirection,
        rtlChange,
        borderradius,
    })
    const defaultCountry = initCountry?.toLowerCase()
    const globalSettings = useSelector((state) => state.globalSettings.global)

    useEffect(() => {
        if (localStorage.getItem('direction')) {
            setLanguageDirection(localStorage.getItem('direction'))
        }
    }, [])

    const changeHandler = (phone) => {
        onHandleChange(phone)
    }

    return (
        <CustomStackFullWidth
            alignItems="flex-start"
            spacing={0.8}
            sx={{
                position: 'relative',
                '.form-control': {
                    opacity: '0',
                    visibility: 'hidden',
                },
            }}
        >
            <PhoneInput
                autoFormat={false}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                placeholder={t('Enter phone number')}
                value={value}
                enableSearchField
                enableSearch
                onChange={changeHandler}
                inputProps={{
                    required: true,
                }}
                specialLabel={t('Phone')}
                country={defaultCountry}
                searchStyle={{ margin: '0', width: '95%', height: '50px' }}
                inputStyle={{
                    width: '100%',
                    height: '45px',
                }}
                containerClass={classes.borderClass}
                dropdownStyle={{ height: '300px', width: '267px' }}
                onlyCountries={[]}
                disableDropdown={globalSettings?.country_picker_status !== 1}
                disableCountryGuess={true}
            />

            <input
                style={{
                    backgroundColor: 'transparent',
                    position: 'absolute',
                    border: `1px solid ${theme.palette.divider}`,
                    borderLeft: 'none',
                    borderTopRightRadius: '10px',
                    borderBottomRightRadius: '10px',
                    outline: 'none',
                    width: 'calc(100% - 52px)',
                    right: 0,
                    top: 0,
                    height: '45px',
                    margin: 0,
                    color: theme.palette.neutral[1000],
                }}
                value={value}
                onChange={(e) => changeHandler(e.target.value)}
                autoFocus={true}
            />
            {touched && errors && (
                <CustomTypography
                    variant="caption"
                    sx={{
                        ml: '10px',
                        fontWeight: 'inherit',
                        color: (theme) => theme.palette.error.main,
                    }}
                >
                    {errors}
                </CustomTypography>
            )}
        </CustomStackFullWidth>
    )
}

export default CustomLoginPhoneNInput
