import {
    Grid,
    Stack,
    Typography,
    MenuItem,
    ListItemIcon,
    Card,
    useMediaQuery,
    Box,
    alpha,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import i18n from 'i18next'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { TopBarButton } from '../../navbar/Navbar.style'
import { useDispatch, useSelector } from 'react-redux'
import { StyledMenu } from '../../navbar/top-navbar/TopNav.style'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import Meta from '../../Meta'
import {
    setCountryCode,
    setIsLanguageChanging,
    setLanguage,
} from '@/redux/slices/languageChange'
import { isRTLLanguage } from '@/utils/customFunctions'
import { languageLists } from '../../navbar/second-navbar/custom-language/languageLists'
import cookie from 'js-cookie'
import { useSettings } from '@/contexts/use-settings'
import CustomImageContainer from '@/components/CustomImageContainer'

const SettingPage = () => {
    const theme = useTheme()
    const { settings, saveSettings } = useSettings()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const router = useRouter()
    const [anchorEl, setAnchorEl] = useState(null)
    const [theme_mode, setThemeMode] = useState('')
    const { global } = useSelector((state) => state.globalSettings)
    const { countryCode, language } = useSelector(
        (state) => state.languageChange
    )
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    useEffect(() => {
        // Perform localStorage action
        if (typeof window !== 'undefined') {
            setThemeMode(localStorage.getItem('mode') || 'light')
        }
    }, [theme_mode])
    useEffect(() => {
        // Perform localStorage action
        if (typeof window !== 'undefined') {
            dispatch(setLanguage(localStorage.getItem('language') || 'en'))
            dispatch(setCountryCode(localStorage.getItem('country')))
        }
    }, [language])

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = Boolean(anchorEl)
    const handleLanguage = async (ln) => {
        // Global overlay (rendered in _app.js) — survives this menu
        // unmounting. Held for a minimum time so fast refetches still give
        // visible feedback instead of an imperceptible flash.
        const shownAt = Date.now()
        dispatch(setIsLanguageChanging(true))
        handleClose()

        dispatch(setLanguage(ln?.languageCode))
        dispatch(setCountryCode(ln?.countryCode))
        localStorage.setItem('language', ln?.languageCode)
        localStorage.setItem('country', ln?.countryCode)
        cookie.set('languageSetting', ln?.languageCode)
        const direction = isRTLLanguage(ln?.languageCode) ? 'rtl' : 'ltr'
        localStorage.setItem('direction', direction)
        // Apply RTL/LTR live — previously the reload picked this up.
        saveSettings({ ...settings, direction })

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
    }

    const languageValue = (language) => {
        return languageLists?.find((item) => {
            if (item?.languageCode === language) {
                return item.languageName
            }
        })
    }

    const selectedCountryFlag = (countryCode) => {
        return languageLists.find((item) => {
            if (item?.countryCode === countryCode) {
                return item?.countryFlag
            }
        })
    }
    const activeFlag = selectedCountryFlag(countryCode)

    const lanColor = theme.palette.neutral[1000]

    const handleThemeChange = (mode) => {
        if (settings?.theme === mode) return
        if (typeof window !== 'undefined') {
            localStorage.setItem('mode', mode)
        }
        saveSettings({ ...settings, theme: mode })
    }

    const themeOptions = [
        { key: 'light', label: t('Light'), icon: LightModeOutlinedIcon },
        { key: 'dark', label: t('Dark'), icon: DarkModeOutlinedIcon },
    ]

    return (
        <>
            {' '}
            <Meta
                title={` My Settings-${global?.business_name}`}
                description=""
                keywords=""
            />
            <CustomPaperBigCard
                padding={isXSmall ? '1rem' : '30px 40px'}
                sx={{ minHeight: !isXSmall ? '558px' : '450px' }}
            >
                <Stack spacing={0.5} mb={3}>
                    <Typography
                        sx={{
                            fontSize: { xs: '18px', md: '20px' },
                            fontWeight: 700,
                            color: theme.palette.neutral[1000],
                        }}
                    >
                        {t('Preferences')}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '13px',
                            color: theme.palette.neutral[600],
                        }}
                    >
                        {t('Customize your appearance and language')}
                    </Typography>
                </Stack>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item md={6} xs={12}>
                        <Card
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: '14px',
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor:
                                    theme.palette.cardBackground1 ??
                                    theme.palette.background.paper,
                                transition:
                                    'border-color .2s ease, box-shadow .2s ease, transform .2s ease',
                                '&:hover': {
                                    borderColor: alpha(
                                        theme.palette.primary.main,
                                        0.4
                                    ),
                                    boxShadow: `0 6px 18px ${alpha(
                                        theme.palette.primary.main,
                                        0.08
                                    )}`,
                                },
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                mb={2}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: alpha(
                                            theme.palette.primary.main,
                                            0.1
                                        ),
                                        color: theme.palette.primary.main,
                                    }}
                                >
                                    {settings?.theme === 'light' ? (
                                        <LightModeOutlinedIcon
                                            sx={{ fontSize: 20 }}
                                        />
                                    ) : (
                                        <DarkModeOutlinedIcon
                                            sx={{ fontSize: 20 }}
                                        />
                                    )}
                                </Box>
                                <Stack spacing={0.25}>
                                    <Typography
                                        sx={{
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            color: theme.palette.neutral[1000],
                                        }}
                                    >
                                        {t('Theme Mode')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            color: theme.palette.neutral[600],
                                        }}
                                    >
                                        {settings?.theme === 'light'
                                            ? t('Light Mode')
                                            : t('Dark Mode')}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                    p: 0.5,
                                    borderRadius: '12px',
                                    backgroundColor: alpha(
                                        theme.palette.primary.main,
                                        0.06
                                    ),
                                    border: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                {themeOptions.map(({ key, label, icon: Icon }) => {
                                    const isActive = settings?.theme === key
                                    return (
                                        <Stack
                                            key={key}
                                            direction="row"
                                            alignItems="center"
                                            justifyContent="center"
                                            spacing={0.75}
                                            onClick={() =>
                                                handleThemeChange(key)
                                            }
                                            sx={{
                                                flex: 1,
                                                cursor: 'pointer',
                                                py: 1,
                                                px: 1.5,
                                                borderRadius: '9px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                transition:
                                                    'background-color .2s ease, color .2s ease, box-shadow .2s ease',
                                                backgroundColor: isActive
                                                    ? theme.palette.primary
                                                          .main
                                                    : 'transparent',
                                                color: isActive
                                                    ? theme.palette.primary
                                                          .contrastText
                                                    : theme.palette.neutral[
                                                          1000
                                                      ],
                                                boxShadow: isActive
                                                    ? `0 4px 10px ${alpha(
                                                          theme.palette
                                                              .primary.main,
                                                          0.25
                                                      )}`
                                                    : 'none',
                                                '&:hover': isActive
                                                    ? {}
                                                    : {
                                                          backgroundColor:
                                                              alpha(
                                                                  theme
                                                                      .palette
                                                                      .primary
                                                                      .main,
                                                                  0.1
                                                              ),
                                                      },
                                            }}
                                        >
                                            <Icon sx={{ fontSize: 18 }} />
                                            <Typography
                                                sx={{
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {label}
                                            </Typography>
                                        </Stack>
                                    )
                                })}
                            </Stack>
                        </Card>
                    </Grid>

                    <Grid item md={6} xs={12}>
                        <Card
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: '14px',
                                border: `1px solid ${theme.palette.divider}`,
                                backgroundColor:
                                    theme.palette.cardBackground1 ??
                                    theme.palette.background.paper,
                                transition:
                                    'border-color .2s ease, box-shadow .2s ease, transform .2s ease',
                                '&:hover': {
                                    borderColor: alpha(
                                        theme.palette.primary.main,
                                        0.4
                                    ),
                                    boxShadow: `0 6px 18px ${alpha(
                                        theme.palette.primary.main,
                                        0.08
                                    )}`,
                                },
                            }}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1.5}
                                mb={2}
                            >
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '10px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: alpha(
                                            theme.palette.primary.main,
                                            0.1
                                        ),
                                        color: theme.palette.primary.main,
                                    }}
                                >
                                    <LanguageOutlinedIcon
                                        sx={{ fontSize: 20 }}
                                    />
                                </Box>
                                <Stack spacing={0.25}>
                                    <Typography
                                        sx={{
                                            fontSize: '15px',
                                            fontWeight: 700,
                                            color: theme.palette.neutral[1000],
                                        }}
                                    >
                                        {t('Language')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '12px',
                                            color: theme.palette.neutral[600],
                                        }}
                                    >
                                        {t('Choose your preferred language')}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <TopBarButton
                                variant="text"
                                size="small"
                                aria-controls={
                                    open ? 'demo-customized-menu' : undefined
                                }
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                disableElevation
                                onClick={handleClick}
                                startIcon={
                                    <Stack
                                        color={theme.palette.neutral[1000]}
                                    >
                                        <CustomImageContainer
                                            width="20px"
                                            src={activeFlag?.countryFlag}
                                        />
                                    </Stack>
                                }
                                endIcon={<KeyboardArrowDownIcon />}
                                sx={{
                                    color: theme.palette.neutral[1000],
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: '10px',
                                    px: 1.5,
                                    py: 0.75,
                                    width: '100%',
                                    justifyContent: 'space-between',
                                    '& .MuiButton-endIcon': {
                                        marginInlineStart: 'auto',
                                    },
                                }}
                            >
                                <span
                                    style={{
                                        padding: '0 10px',
                                        color: lanColor,
                                    }}
                                >
                                    {languageValue(language)?.languageName}
                                </span>
                            </TopBarButton>
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
                                            '&:hover': {
                                                backgroundColor: 'primary.main',
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: '28px',
                                                marginInlineEnd: '8px',
                                            }}
                                        >
                                            <img
                                                alt=""
                                                width="20"
                                                src={lan?.countryFlag}
                                            />
                                        </ListItemIcon>
                                        {lan.languageName}
                                    </MenuItem>
                                ))}
                            </StyledMenu>
                        </Card>
                    </Grid>
                </Grid>
            </CustomPaperBigCard>
        </>
    )
}

export default SettingPage
