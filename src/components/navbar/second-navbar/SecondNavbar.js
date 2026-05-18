import { setOfflineWithPartials } from '@/redux/slices/OfflinePayment'
import { SignInButton } from '@/styled-components/CustomButtons.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ChatIcon from '@mui/icons-material/Chat'
import LockIcon from '@mui/icons-material/Lock'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import { Avatar, Box, ButtonBase, NoSsr, Stack, styled } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import useClickOutside from '../../../utils/use-click-outside'
import CustomLanguage from '../../CustomLanguage'
import { RTL } from '../../RTL/RTL'
import AuthModal from '../../auth'
import { getToken } from '../../checkout-page/functions/getGuestUserId'
import CustomContainer from '../../container'
import { CustomTypography } from '../../custom-tables/Tables.style'
import SearchBox from '../../home/hero-section-with-search/SearchBox'
import { AccountPopover } from '../AccountPopover'
import CustomDrawerWishlist from '../CustomDrawerWishlist'
import { CustomNavSearchIcon, LefRightBorderBox } from '../Navbar.style'
import ThemeSwitches from '../top-navbar/ThemeSwitches'
import AddressReselect from '../top-navbar/address-reselect/AddressReselect'
import LogoSide from './LogoSide'
import NavLinks from './NavLinks'
import Wishlist from './Wishlist'

export const getSelectedAddons = (addon) => {
    return addon?.filter((item) => {
        return item?.isChecked !== undefined && item?.isChecked !== false
    })
}
export const getSelectedVariations = (variations) => {
    let selectedItem = []
    if (variations?.length > 0) {
        variations?.forEach((item, index) => {
            item?.values?.forEach((value, optionIndex) => {
                if (value?.isSelected) {
                    const itemObj = {
                        choiceIndex: index,
                        isSelected: value?.isSelected,
                        label: value?.label,
                        optionIndex: optionIndex,
                        optionPrice: value?.optionPrice,
                        current_stock: value?.current_stock,
                        option_id: value?.option_id,
                        stock_type: value?.stock_type,
                    }
                    selectedItem.push(itemObj)
                }
            })
        })
    }
    return selectedItem
}

export const CustomNavBox = styled(Box)(({ theme }) => ({
    background: theme.palette.navbarBg,
    boxShadow: '0px 5px 15px 0px rgba(0, 0, 0, 0.05)',
}))
const SecondNavbar = ({ cartListRefetch }) => {
    const [modalFor, setModalFor] = useState('sign-in')
    const [openSearchBox, setOpenSearchBox] = useState(false)
    const [authModalOpen, setOpen] = useState(false)
    const [openPopover, setOpenPopover] = useState(false)
    const [openWishlistModal, setOpenWishlistModal] = useState(false)
    const { userData } = useSelector((state) => state.user)
    const token = getToken()
    const { t } = useTranslation()
    const router = useRouter()
    const { query } = router.query
    const { global, userLocationUpdate } = useSelector(
        (state) => state.globalSettings
    )
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const dispatch = useDispatch()
    const anchorRef = useRef(null)

    const { countryCode, language } = useSelector(
        (state) => state.languageChange
    )
    const businessLogo = global?.logo_full_url

    const handleOpenPopover = () => {
        setOpenPopover(true)
        setModalFor('sign-in')
    }
    const handleSearchBoxOpen = (e) => {
        e.stopPropagation()
        setOpenSearchBox(true)
    }
    const searchBoxRef = useClickOutside(() => {
        setOpenSearchBox(false)
    })

    const handleOpenAuthModal = () => setOpen(true)
    const handleCloseAuthModal = () => {
        setOpen(false)
        setModalFor('sign-in')
    }

    const handleClosePopover = () => {
        setOpenPopover(false)
    }

    let zoneid = undefined
    let location = undefined
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        zoneid = localStorage.getItem('zoneid')
        languageDirection = localStorage.getItem('direction')
        location = localStorage.getItem('location')
    }

    const handleClick = (value) => {
        router.push({
            pathname: '/info',
            query: {
                page: value,
            },
        })
    }

    useEffect(() => {
        if (router.pathname !== '/checkout') {
            dispatch(setOfflineWithPartials(false))
        }
    }, [router.pathname])
    console.log({userData});
    
    const handleAuthBasedOnRoute = () => {
        return (
            <RTL direction={languageDirection}>
                {!token ? (
                    <Stack direction="row" paddingInline=".5rem">
                        <SignInButton
                            onClick={handleOpenAuthModal}
                            variant="contained"
                            startIcon={
                                <PersonOutlineRoundedIcon sx={{ fontSize: '20px !important' }} />
                            }
                        >
                            <CustomTypography
                                sx={{
                                    color: (theme) =>
                                        theme.palette.whiteContainer.main,
                                    fontSize: '14px',
                                    fontWeight: 600,
                                }}
                            >
                                {t('Sign In')}
                            </CustomTypography>
                        </SignInButton>
                        <AuthModal
                            cartListRefetch={cartListRefetch}
                            open={authModalOpen}
                            modalFor={modalFor}
                            setModalFor={setModalFor}
                            handleClose={handleCloseAuthModal}
                        />
                    </Stack>
                ) : (
                    <>
                        <Stack direction="row" spacing={1}>
                            <Box
                                align="center"
                                component={ButtonBase}
                                alignItems="center"
                                onClick={() => handleClick('inbox')}
                            >
                                <IconButton>
                                    <ChatIcon
                                        sx={{
                                            height: 25,
                                            width: 25,
                                            color: (theme) =>
                                                theme.palette.primary.main,
                                        }}
                                    ></ChatIcon>
                                </IconButton>
                            </Box>
                            {token && !isSmall && (
                                <LefRightBorderBox>
                                    <Wishlist
                                        handleClick={() =>
                                            setOpenWishlistModal(true)
                                        }
                                    />
                                    <CustomDrawerWishlist
                                        openWishlistModal={openWishlistModal}
                                        setOpenWishlistModal={
                                            setOpenWishlistModal
                                        }
                                    />
                                </LefRightBorderBox>
                            )}

                            <Box
                                align="center"
                                ml={languageDirection !== 'rtl' && '.9rem'}
                                mr={languageDirection === 'rtl' && '.9rem'}
                                component={ButtonBase}
                                onClick={handleOpenPopover}
                                ref={anchorRef}
                                sx={{ paddingInline: '10px' }}
                            >
                                <Avatar
                                    sx={{
                                        height: 30,
                                        width: 30,
                                        backgroundColor: userData?.image
                                            ? (theme) =>
                                                theme.palette.neutral[500]
                                            : (theme) =>
                                                theme.palette.neutral[400],
                                    }}
                                    src={userData?.image_full_url}
                                />
                            </Box>
                        </Stack>
                        <AccountPopover
                            anchorEl={anchorRef.current}
                            onClose={handleClosePopover}
                            open={openPopover}
                            cartListRefetch={cartListRefetch}
                        />
                    </>
                )}
            </RTL>
        )
    }
    const handleShowSearch = () => {
        if (location) {
            return (
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: '560px',
                        '& form': { width: '100%' },
                        '& form > div': {
                            background: 'transparent !important',
                            border: 'none !important',
                        },
                        '& .MuiInputBase-root': {
                            borderRadius: '999px',
                            backgroundColor: (theme) =>
                                `${theme.palette.mode === 'dark'
                                    ? theme.palette.background.paper
                                    : '#FFFFFF'} !important`,
                            border: (theme) =>
                                `1px solid ${theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.12)'
                                    : '#E2E8F0'}`,
                            paddingInline: '14px',
                            height: '40px',
                            gap: '10px',
                            boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                            transition: 'border-color .2s ease, box-shadow .2s ease',
                        },
                        '& .MuiInputBase-root:hover': {
                            borderColor: (theme) =>
                                theme.palette.primary.main,
                        },
                        '& .MuiInputBase-root.Mui-focused, & .MuiInputBase-root:focus-within': {
                            borderColor: (theme) =>
                                theme.palette.primary.main,
                            boxShadow: '0 0 0 4px rgba(255,117,24,.14)',
                        },
                        '& .MuiInputBase-input': {
                            padding: '0 !important',
                            fontSize: '14px !important',
                            color: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? '#fff'
                                    : '#0F172A',
                            height: 'auto !important',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: '#94A3B8',
                            opacity: 1,
                        },
                        '& .MuiSvgIcon-root': {
                            color: '#94A3B8',
                        },
                        '& .MuiInputAdornment-positionStart .MuiSvgIcon-root': {
                            fontSize: '20px',
                        },
                        '& .MuiInputAdornment-positionEnd .MuiIconButton-root': {
                            width: 28,
                            height: 28,
                            backgroundColor: '#FFF4EC',
                            '& .MuiSvgIcon-root': {
                                color: (theme) => theme.palette.primary.main,
                                fontSize: '16px',
                            },
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.primary.main,
                                '& .MuiSvgIcon-root': {
                                    color: '#fff',
                                },
                            },
                        },
                    }}
                >
                    <SearchBox
                        query={query}
                        setOpenSearchBox={setOpenSearchBox}
                    />
                </Box>
            )
        } else if (
            router.pathname !== '/home' &&
            location &&
            router.pathname !== '/'
        ) {
            return (
                <Stack
                    onClick={(e) => handleSearchBoxOpen(e)}
                    sx={{
                        transition: 'all ease .4s',
                        marginInlineStart: 'auto',
                    }}
                >
                    <CustomNavSearchIcon>
                        <SearchOutlinedIcon
                            sx={{ fontSize: '20px' }}
                            color="primary"
                        />
                    </CustomNavSearchIcon>
                </Stack>
            )
        }
    }

    return (
        <CustomNavBox>
            <CustomContainer>
                <Toolbar
                    disableGutters={true}
                    sx={{ minHeight: { xs: 58, md: 58 } }}
                >
                    <Stack
                        ref={searchBoxRef}
                        direction="row"
                        alignItems="center"
                        spacing={{ xs: 1.5, md: 3 }}
                        sx={{ width: '100%', minHeight: { xs: 58, md: 58 } }}
                    >
                        {/* 1. Logo + business name */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            onClick={() => {
                                const hasLocation =
                                    typeof window !== 'undefined' &&
                                    Boolean(localStorage.getItem('location'))
                                router.push(hasLocation ? '/home' : '/')
                            }}
                            sx={{ cursor: 'pointer', flexShrink: 0 }}
                        >
                            <Box
                                sx={{
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                {businessLogo ? (
                                    <Box
                                        component="img"
                                        src={businessLogo}
                                        alt="logo"
                                        sx={{
                                            height: '100%',
                                            width: 'auto',
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : null}
                            </Box>
                        </Stack>

                        {/* 2. Nav links */}
                        {!isSmall && (
                            <Box sx={{ flexShrink: 0 }}>
                                <NavLinks
                                    languageDirection={languageDirection}
                                    t={t}
                                    zoneid={zoneid}
                                />
                            </Box>
                        )}

                        {/* 3. Search — grows, right-aligned for constant gap to auth */}
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                minWidth: 0,
                            }}
                        >
                            {handleShowSearch()}
                        </Box>

                        {/* 4. Auth / Sign-in / Avatar — right */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            sx={{ flexShrink: 0 }}
                        >
                            {!isSmall && !location && router.pathname === '/' && (
                                <ThemeSwitches />
                            )}
                            <Box
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    height: '40px',
                                    alignItems: 'center',
                                }}
                            >
                                {handleAuthBasedOnRoute()}
                            </Box>
                        </Stack>
                    </Stack>
                </Toolbar>
            </CustomContainer>
        </CustomNavBox>
    )
}
export default SecondNavbar
