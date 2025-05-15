import { setOfflineWithPartials } from '@/redux/slices/OfflinePayment'
import { SignInButton } from '@/styled-components/CustomButtons.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ChatIcon from '@mui/icons-material/Chat'
import LockIcon from '@mui/icons-material/Lock'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
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

export const CustomNavBox = styled(Box)(({ theme, isSticky }) => ({
    display: isSticky ? 'visible' : 'hidden',
    background: theme.palette.navbarBg,
    boxShadow: '0px 5px 15px 0px rgba(0, 0, 0, 0.05)',
}))
const SecondNavbar = ({ isSticky, cartListRefetch }) => {
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
    const businessLogo = global?.fav_icon_full_url

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

    const handleAuthBasedOnRoute = () => {
        return (
            <RTL direction={languageDirection}>
                {!token ? (
                    <Stack direction="row" paddingInline=".5rem">
                        <SignInButton
                            onClick={handleOpenAuthModal}
                            variant="contained"
                        >
                            <CustomStackFullWidth
                                direction={
                                    languageDirection === 'rtl'
                                        ? 'row'
                                        : 'row-reverse'
                                }
                                alignItems="center"
                                spacing={1}
                            >
                                <CustomTypography
                                    sx={{
                                        color: (theme) =>
                                            theme.palette.whiteContainer.main,
                                    }}
                                >
                                    {t('Sign In')}
                                </CustomTypography>
                                <LockIcon fontSize="small" />
                            </CustomStackFullWidth>
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
                                alignItem="center"
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
                                                  theme.palette.neutral[100]
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
        if ((router.pathname === '/home' && location) || openSearchBox) {
            return (
                <Box sx={{ minWidth: '450px', marginInlineEnd: '20px' }}>
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
                    sx={{ transition: 'all ease .4s' }}
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
        <NoSsr>
            <CustomNavBox isSticky={isSticky}>
                <CustomContainer>
                    <Toolbar disableGutters={true}>
                        <CustomStackFullWidth
                            ref={searchBoxRef}
                            direction="row"
                            justifyContent="space-between"
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                gap="1rem"
                            >
                                {!location && (
                                    <LogoSide
                                        global={global}
                                        width="unset"
                                        businessLogo={businessLogo}
                                    />
                                )}
                                {!location && (
                                    <AddressReselect
                                        location={location}
                                        userLocationUpdate={userLocationUpdate}
                                    />
                                )}
                                {!isSmall && location && (
                                    <NavLinks
                                        languageDirection={languageDirection}
                                        t={t}
                                        zoneid={zoneid}
                                    />
                                )}
                            </Stack>
                            <Stack direction="row" alignItems="center">
                                {handleShowSearch()}
                                {!isSmall && !location && (
                                    <Stack flexDirection="row" mr="45px">
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            justifyContent="end"
                                            mr="45px"
                                        >
                                            <ThemeSwitches />
                                        </Stack>
                                        <CustomLanguage
                                            countryCode={countryCode}
                                            language={language}
                                        />
                                    </Stack>
                                )}
                                <Box
                                    sx={{
                                        display: { xs: 'none', md: 'flex' },
                                        flexGrow: 0,
                                        height: '40px',
                                        alignItems: 'center',
                                    }}
                                >
                                    {handleAuthBasedOnRoute()}
                                </Box>
                                {!isSmall && location && (
                                    <CustomLanguage
                                        countryCode={countryCode}
                                        language={language}
                                    />
                                )}
                            </Stack>
                        </CustomStackFullWidth>
                    </Toolbar>
                </CustomContainer>
            </CustomNavBox>
        </NoSsr>
    )
}
export default SecondNavbar
