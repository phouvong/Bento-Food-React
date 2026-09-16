import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { ListItemIcon, MenuItem, Stack, Typography, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import i18n from 'i18next'
import cookie from 'js-cookie'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useSettings } from '@/contexts/use-settings'
import {
    setCountryCode,
    setCountryFlag,
    setIsLanguageChanging,
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
    const queryClient = useQueryClient()
    const router = useRouter()


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
    const handleLanguage = async (ln) => {
        // Global overlay (rendered in _app.js) — survives this menu/drawer
        // unmounting. Held for a minimum time so fast refetches still give
        // visible feedback instead of an imperceptible flash.
        const shownAt = Date.now()
        dispatch(setIsLanguageChanging(true))
        handleClose()

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

        // Swap UI translations in place, then refetch all active queries so
        // API data re-arrives in the new language (the MainApi interceptor
        // reads `language` from localStorage on every request) — no reload.
        // invalidateQueries resolves once active refetches settle, which
        // bounds how long the blocking backdrop stays up.
        // router.replace(asPath) re-runs the current page's getServerSideProps
        // (which reads the languageSetting cookie set above) so SSR pages like
        // the landing page also re-arrive in the new language — no-op on
        // pages without server-side props.
        i18n.changeLanguage(ln?.languageCode)
        try {
            // Cap the blocking overlay at MAX_VISIBLE_MS — slow queries keep
            // refetching in the background (react-query swaps each one in as
            // it lands) instead of holding the whole screen hostage.
            const MAX_VISIBLE_MS = 2500
            await Promise.race([
                Promise.all([
                    queryClient.invalidateQueries(),
                    router.replace(router.asPath, undefined, {
                        scroll: false,
                    }),
                ]),
                new Promise((resolve) =>
                    setTimeout(resolve, MAX_VISIBLE_MS)
                ),
            ])
        } finally {
            const MIN_VISIBLE_MS = 600
            const remaining = MIN_VISIBLE_MS - (Date.now() - shownAt)
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, remaining))
            }
            dispatch(setIsLanguageChanging(false))
        }

        CustomToaster('success', 'Language Changed Successfully')
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
