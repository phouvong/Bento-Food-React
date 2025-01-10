import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import PhoneInput from 'react-phone-input-2'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CustomTypography } from './custom-tables/Tables.style'

const useStyles = makeStyles((theme) => ({
    borderClass: ({ theme, focus, languageDirection, borderradius }) => ({
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

const CustomPhoneInput = ({
    value,
    onHandleChange,
    initCountry,
    touched,
    errors,
    rtlChange,
    borderradius,
    autoFocus,
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

    const changeHandler = (e) => {
        onHandleChange(e)
    }

    return (
        <CustomStackFullWidth alignItems="flex-start" spacing={0.8}>
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
                    autoFocus: !!autoFocus,
                }}
                specialLabel={t('Phone')}
                country={defaultCountry}
                searchStyle={{ margin: '0', width: '95%', height: '36px' }}
                inputStyle={{
                    width: '100%',
                    height: '45px',
                }}
                containerClass={classes.borderClass}
                dropdownStyle={{ height: '197px', width: '267px' }}
                onlyCountries={[]}
                disableDropdown={globalSettings?.country_picker_status !== 1}
            />
            {touched && errors && (
                <CustomTypography
                    sx={{
                        ml: '10px',
                        fontWeight: 'inherit',
                        color: (theme) => theme.palette.error.main,
                        fontTransform: 'uppercase',
                        fontSize: '10px',
                    }}
                >
                    {errors}
                </CustomTypography>
            )}
        </CustomStackFullWidth>
    )
}

export default CustomPhoneInput
