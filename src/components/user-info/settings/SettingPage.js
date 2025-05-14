import {
    Grid,
    Stack,
    Typography,
    MenuItem,
    ListItemIcon,
    Card,
    useMediaQuery,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTranslation } from 'react-i18next'
import { TopBarButton } from '../../navbar/Navbar.style'
import { useDispatch, useSelector } from 'react-redux'
import { StyledMenu } from '../../navbar/top-navbar/TopNav.style'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import Meta from '../../Meta'
import { setCountryCode, setLanguage } from '@/redux/slices/languageChange'
import { isRTLLanguage } from '@/utils/customFunctions'
import { languageLists } from '../../navbar/second-navbar/custom-language/languageLists'
import cookie from 'js-cookie'
import ThemeSwitches from '@/components/navbar/top-navbar/ThemeSwitches'
import { useSettings } from '@/contexts/use-settings'
import CustomImageContainer from '@/components/CustomImageContainer'

const SettingPage = () => {
    const theme = useTheme()
    const { settings, saveSettings } = useSettings()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { t } = useTranslation()
    const dispatch = useDispatch()
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
    const handleLanguage = (ln) => {
        dispatch(setLanguage(ln?.languageCode))
        dispatch(setCountryCode(ln?.countryCode))
        localStorage.setItem('language', ln?.languageCode)
        localStorage.setItem('country', ln?.countryCode)
        cookie.set('languageSetting', ln?.languageCode)
        localStorage.setItem(
            'direction',
            isRTLLanguage(ln?.languageCode) ? 'rtl' : 'ltr'
        )

        window.location.reload()
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
                <Grid container spacing={2}>
                    <Grid item md={4} xs={12}>
                        <Card
                            sx={{
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                maxWidth: '247px',
                                height: '168px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                backgroundColor: (theme) =>
                                    theme.palette.cardBackground1,
                            }}
                        >
                            <CustomStackFullWidth spacing={2}>
                                <Typography
                                    sx={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        textAlign: 'center',
                                    }}
                                >
                                    {settings?.theme === 'light'
                                        ? t('Light Mode')
                                        : t('Dark Mode')}
                                </Typography>
                                <ThemeSwitches noText />
                            </CustomStackFullWidth>
                        </Card>
                    </Grid>

                    <Grid item md={4} xs={12}>
                        <Card
                            sx={{
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                maxWidth: '247px',
                                height: '168px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                backgroundColor: (theme) =>
                                    theme.palette.cardBackground1,
                            }}
                        >
                            <CustomStackFullWidth
                                spacing={2}
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Typography
                                    sx={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        textAlign: 'center',
                                    }}
                                >
                                    {t('Language')}
                                </Typography>

                                <TopBarButton
                                    variant="text"
                                    size="small"
                                    aria-controls={
                                        open
                                            ? 'demo-customized-menu'
                                            : undefined
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
                                        color: (theme) =>
                                            theme.palette.neutral[1000],
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
                                        'aria-labelledby':
                                            'demo-customized-button',
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
                                                    backgroundColor:
                                                        'primary.main',
                                                },
                                            }}
                                        >
                                            <ListItemIcon>
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
                            </CustomStackFullWidth>
                        </Card>
                    </Grid>
                </Grid>
            </CustomPaperBigCard>
        </>
    )
}

export default SettingPage
