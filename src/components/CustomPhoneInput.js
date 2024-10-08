import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PhoneInput from 'react-phone-input-2';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style';
import { CustomTypography } from './custom-tables/Tables.style';

const useStyles = makeStyles((theme) => ({
    borderClass: ({ theme, focus, languageDirection, rtlChange }) => ({
        '&.react-tel-input .special-label': {
            fontSize: "14px",
            fontWeight: 400,
            color: focus ? theme.palette.primary.main : theme.palette.neutral[900],
            left: languageDirection === 'rtl' ? '80%' : '10px',
            background: theme.palette.background.paper,
        },
        '&.react-tel-input .form-control': {
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper,
            color: theme.palette.neutral[1000],
            padding: languageDirection === 'rtl' ? '18.5px 58px 18.5px 10px' : '18.5px 14px 18.5px 52px',
            ...(languageDirection === "rtl" && {
                textAlign: "right",
                direction: "rtl",
                unicodeBidi: "plaintext",
            }),
        },
        '&.react-tel-input .form-control:focus': {
            border: `1px solid ${theme.palette.primary.main}`,
            zIndex: 999,
            boxShadow: 'none',
        },
        '&.react-tel-input .country-list .country-name': {
            color: theme.palette.neutral[400],
        },
        '&.react-tel-input .selected-flag': {
            backgroundColor: theme.palette.background.paper,
            border: focus ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
            borderRight: "none",
            padding: languageDirection === 'rtl' ? '0 25px 0 11px' : ' 0 0px 0 11px',
        },
        '&.react-tel-input .selected-flag .arrow': {
            left: languageDirection === 'rtl' ? '13px' : '29px',
        },
        '&.react-tel-input .flag-dropdown.open .selected-flag': {
            backgroundColor: 'unset'
        },
        '&.react-tel-input .country-list': {
            backgroundColor: theme.palette.background.paper,
        },
        "&.react-tel-input .country-list .search-box": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.neutral[600]
        },
        "&.react-tel-input .country-list .search": {
            backgroundColor: theme.palette.background.paper,
        },
    }),
}));

const CustomPhoneInput = ({
                              value,
                              onHandleChange,
                              initCountry,
                              touched,
                              errors,
                              rtlChange,
                              width,
                          }) => {
    const changeHandler = (e) => {
        onHandleChange(e);
    };
    const { t } = useTranslation();
    const theme = useTheme();
    const [languageDirection, setLanguageDirection] = useState('ltr');
    const [focus, setFocus] = useState(false);
    const classes = useStyles({ theme, focus, languageDirection, rtlChange });
    const defaultCountry = initCountry?.toLowerCase();
    const globalSettings = useSelector((state) => state.globalSettings.global);

    useEffect(() => {
        if (localStorage.getItem('direction')) {
            setLanguageDirection(localStorage.getItem('direction'));
        }
    }, []);

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
                    autoFocus: false,
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
                {...(globalSettings?.country_picker_status !== 1 && { disableDropdown: true })}
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
    );
};

export default CustomPhoneInput;
