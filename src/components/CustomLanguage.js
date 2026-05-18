import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { ListItemIcon, MenuItem, Stack, Typography, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import i18n from 'i18next'
import cookie from 'js-cookie'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSettings } from '@/contexts/use-settings'
import {
    setCountryCode,
    setCountryFlag,
    setLanguage,
} from '@/redux/slices/languageChange'
import { CustomColouredTypography } from '@/styled-components/CustomStyles.style'
import { isRTLLanguage, languageValue } from '@/utils/customFunctions'
import { CustomToaster } from './custom-toaster/CustomToaster'
import { LefRightBorderBox, TopBarButton } from './navbar/Navbar.style'
import { languageLists } from './navbar/second-navbar/custom-language/languageLists'
import { StyledMenu } from './navbar/top-navbar/TopNav.style'

const CustomLanguage = ({ formMobileMenu, language, isMobile, noLocation }) => {
    const theme = useTheme()
    const dispatch = useDispatch()
    console.log({language});
    

    const [anchorEl, setAnchorEl] = useState(null)
    const [mounted, setMounted] = useState(false)
    const { countryFlag } = useSelector((state) => state.languageChange)
    let location = undefined
    if (typeof window !== 'undefined') {
        location = localStorage.getItem('location')
    }

    useEffect(() => {
        setMounted(true)
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem('language') || i18n.language
            dispatch(setLanguage(savedLanguage))
            const langData = languageLists.find(
                (l) => l.languageCode === savedLanguage
            )
            if (langData) {
                dispatch(setCountryCode(langData.countryCode))
                dispatch(setCountryFlag(langData.countryFlag))
            }
        }
    }, [language])
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const getValues = (settings) => ({
        direction: settings.direction,
        responsiveFontSizes: settings.responsiveFontSizes,
        theme: settings.theme,
    })
    const { settings, saveSettings } = useSettings()
    const [values, setValues] = useState(getValues(settings))
    useEffect(() => {
        setValues(getValues(settings))
    }, [settings])
    const open = Boolean(anchorEl)
    const handleLanguage = (ln) => {
        dispatch(setLanguage(ln?.languageCode))
        dispatch(setCountryCode(ln?.countryCode))
        dispatch(setCountryFlag(ln?.countryFlag))

        localStorage.setItem('language', ln?.languageCode)
        cookie.set('languageSetting', ln?.languageCode)

        localStorage.setItem(
            'direction',
            isRTLLanguage(ln?.languageCode) ? 'rtl' : 'ltr'
        )
        saveSettings({
            ...values,
            direction: isRTLLanguage(ln?.languageCode) ? 'rtl' : 'ltr',
        })

        CustomToaster('success', 'Language Changed Successfully')

        window.location.reload()
    }
    const arrowColor = theme.palette.neutral[500]
    const marginRight = languageDirection === 'rtl' ? '1rem' : '0px';
   console.log({countryFlag});
   

    return (
        <>
            <LefRightBorderBox location={location} isMobile={isMobile}>
                <TopBarButton
                    formMobileMenu={formMobileMenu}
                    variant="text"
                    size="small"
                    sx={
                        noLocation
                            ? {
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  border: `1px solid ${theme.palette.divider}`,
                                  backgroundColor:
                                      theme.palette.mode === 'dark'
                                          ? alpha(theme.palette.common.white, 0.06)
                                          : '#FFFFFF',
                                  fontWeight: 600,
                                  fontSize: '12.5px',
                                  color: theme.palette.text.primary,
                                  minWidth: 'auto',
                                  '&:hover': {
                                      backgroundColor:
                                          theme.palette.mode === 'dark'
                                              ? alpha(
                                                    theme.palette.common.white,
                                                    0.1
                                                )
                                              : '#FFFFFF',
                                      borderColor: theme.palette.primary.main,
                                  },
                              }
                            : { py: '4px' }
                    }
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    disableElevation
                    onClick={handleClick}
                    endIcon={
                        <KeyboardArrowDownIcon
                            style={{
                                color: arrowColor,
                                marginInlineStart: noLocation ? '2px' : '10px',
                                fontSize: noLocation ? '16px' : undefined,
                            }}
                        />
                    }
                    noLocation={noLocation}
                >
                    <Stack
                        flexDirection="row"
                        alignItems="center"
                        gap={noLocation ? '6px' : '10px'}
                    >
                        <img
                            width={noLocation ? '16' : '20'}
                            height={noLocation ? '11' : undefined}
                            alt=""
                            src={countryFlag}
                            style={
                                noLocation
                                    ? {
                                          borderRadius: '2px',
                                          objectFit: 'cover',
                                      }
                                    : undefined
                            }
                        />
                        <CustomColouredTypography
                            color={
                                noLocation
                                    ? theme.palette.text.primary
                                    : theme.palette.neutral[600]
                            }
                            sx={{
                                textTransform: 'capitalize',
                                width: noLocation ? 'auto' : '10px',
                                fontWeight: noLocation ? 600 : undefined,
                            }}
                            fontSize={
                                noLocation
                                    ? '12.5px'
                                    : { xs: '14px', sm: '16px' }
                            }
                        >
                            {mounted ? languageValue(language)?.languageCode : ''}
                        </CustomColouredTypography>
                    </Stack>
                </TopBarButton>
            </LefRightBorderBox>
            <StyledMenu
                id="demo-customized-menu"
                MenuListProps={{
                    'aria-labelledby': 'demo-customized-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {languageLists?.map((lan, index) => (
                    <MenuItem
                        onClick={() => handleLanguage(lan)}
                        disableRipple
                        key={index}
                        sx={{
                            backgroundColor:
                                language === lan.languageCode
                                    ? theme.palette.neutral[200]
                                    : 'inherit',
                            '&:hover': {
                                backgroundColor: theme.palette.neutral[200],
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: '20px !important',
                                marginInlineEnd: '8px',
                            }}
                        >
                            <img width="20" alt="" src={lan?.countryFlag} />
                        </ListItemIcon>
                        <Typography
                            fontSize={{ xs: '14px', sm: '14px' }}
                            marginInlineEnd={marginRight}
                            sx={{
                                '&:hover': {
                                    fontWeight: 700,
                                },
                                fontWeight:language === lan.languageCode ? 500 : 400,
                            }}
                        >
                            {lan.languageName}
                        </Typography>
                    </MenuItem>
                ))}
            </StyledMenu>
        </>
    )
}

CustomLanguage.propTypes = {}

export default CustomLanguage
