import React, { useEffect, useState } from 'react'
import { Grid, useTheme, useMediaQuery, Stack, Typography, IconButton } from '@mui/material'
import { useQuery } from 'react-query'

import {
    WalletIcon,
    WishlistIcon,
    OrderIcon,
    LoyaltyPointIcon,
} from './ProfileStatIcon'
import CustomShimmerForProfile from '../../customShimmerForProfile/customShimmerForProfile'
import ProfileStatistics from './ProfileStatistics'
import { ProfileApi } from "@/hooks/react-query/config/profileApi"
import { setUser } from "@/redux/slices/customer"
import { useDispatch, useSelector } from 'react-redux'
import { getAmount } from "@/utils/customFunctions"
import { CustomPaperBigCard, CustomStackFullWidth, SliderCustom } from "@/styled-components/CustomStyles.style"
import { t } from 'i18next'
import { useUserDelete } from "@/hooks/react-query/user-delete/useUserDelete"
import AuthModal from '../../auth'
import { useRouter } from 'next/router'
import { onSingleErrorResponse } from '../../ErrorResponse'
import { toast } from 'react-hot-toast'
import { setWalletAmount } from "@/redux/slices/cart"
import PersonalDetails from './PersonalDetails'
import MyAddresses from './MyAddresses'
import EditProfile from './EditProfile'
import Meta from '../../Meta'
import { removeToken } from "@/redux/slices/userToken"
import { clearWishList } from "@/redux/slices/wishList"
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import UserIcon from '../../../assets/images/icons/UserIcon'
import DeleteAccount from './DeleteAccount'
import MoreDotIcon from '../../../assets/images/icons/MoreDotIcon'
import CustomPopover from '../../custom-popover/CustomPopover'
import Slider from '@/components/slider/SlickToSwiper'
import { setEditProfile } from "@/redux/slices/editProfile"

const ProfilePage = () => {
    const router = useRouter()
    const [authModalOpen, setOpen] = useState(false)
    const [modalFor, setModalFor] = useState('sign-in')
    const [anchorEl, setAnchorEl] = useState(null);
    const { wishLists } = useSelector((state) => state.wishList)
    const { isEditProfile } = useSelector((state) => state.isEditProfile);
    const [deleteModal, setDeleteModal] = useState(false)
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const languageDirection = localStorage.getItem('direction')
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const { userData } = useSelector((state) => state.user)
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    const { isLoading, data, isError, error, refetch } = useQuery(
        ['profile-info'],
        ProfileApi.profileInfo,
        {
            enabled: false,
            onError: onSingleErrorResponse,
        }
    )
    if (data) {
        localStorage.setItem('wallet_amount', data?.data?.wallet_balance)
        dispatch(setWalletAmount(data?.data?.wallet_balance))
        dispatch(setUser(data?.data))
    }
    const handleOpenAuthModal = () => setOpen(true)
    const handleCloseAuthModal = () => {
        setOpen(false)
    }
    const addCurrencySymbol = getAmount(
        data?.data?.wallet_balance,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint
    )
    const onSuccessHandlerForUserDelete = async (res) => {
        localStorage.removeItem('token')
        dispatch(removeToken())
        dispatch(clearWishList([]))
        toast.success('Account has been deleted')
        handleCloseAuthModal()
        handleOpenAuthModal()
        await router.push('/')
    }
    const { mutate, isLoading: deleteUserIsLoading } = useUserDelete(onSuccessHandlerForUserDelete)
    const deleteUserHandler = () => {
        mutate()
    }
    useEffect(() => {
        refetch().then()
        data && dispatch(setUser(data?.data))
    }, [])
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setDeleteModal(false)
        setAnchorEl(null)
    };
    const settings = {
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 2000,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1600,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1340,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 1075,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 999,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 800,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 670,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 540,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 450,
                settings: {
                    slidesToShow: 1.8,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 370,
                settings: {
                    slidesToShow: 1.5,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
            {
                breakpoint: 300,
                settings: {
                    slidesToShow: 1.3,
                    slidesToScroll: 1,
                    infinite: false,
                },
            },
        ],
    }
    return (
        <>
            <Meta title={data?.data?.f_name} description="" keywords="" />
            <AuthModal
                open={authModalOpen}
                setOpen={setOpen}
                handleClose={handleCloseAuthModal}
                modalFor={modalFor}
                setModalFor={setModalFor}
            />
            {data ? (
                <CustomStackFullWidth gap="15px">
                    {((!isSmall && isEditProfile === false) || (isSmall && isEditProfile === false)) &&
                        <SliderCustom
                            languageDirection={languageDirection}
                            gap="0"
                        >
                            <Slider {...settings} gap="16px">
                                <ProfileStatistics
                                    value={userData?.order_count}
                                    title="Orders"
                                    icon={OrderIcon}
                                    pathname="order"
                                />
                                {global?.customer_wallet_status !== 0 && (
                                    <ProfileStatistics
                                        value={addCurrencySymbol}
                                        title="Amount in Wallet"
                                        icon={WalletIcon}
                                        pathname="wallets"
                                    />
                                )}
                                {global?.loyalty_point_status !== 0 && (
                                    <ProfileStatistics
                                        value={userData?.loyalty_point}
                                        title="Loyalty Points"
                                        icon={LoyaltyPointIcon}
                                        pathname="loyalty"
                                    />
                                )}
                                <ProfileStatistics
                                    value={wishLists?.food?.length}
                                    title="Products in wishlist"
                                    icon={WishlistIcon}
                                    pathname="wishlist"
                                />
                            </Slider>
                        </SliderCustom>
                    }
                    <Stack gap={isEditProfile ? 0 : "15px"}>
                        <CustomPaperBigCard
                            padding={isSmall ? "8px 10px" : "20px 25px"}
                            noboxshadow="true"
                            sx={{
                                minHeight: isEditProfile ? (!isSmall ? '558px' : "450px") : 0,
                                // Anchor for the mobile edit button so it can
                                // overlay the top-right corner without pushing
                                // PersonalDetails down with a full empty row.
                                position: 'relative',
                            }}
                        >
                            <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                sx={{
                                    // On mobile (non-edit mode) the title row
                                    // is empty save for the edit button —
                                    // overlay it top-right instead of letting
                                    // it take a full row above PersonalDetails.
                                    ...(isSmall && !isEditProfile && {
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        zIndex: 2,
                                        width: 'auto',
                                    }),
                                }}
                            >
                                <CustomStackFullWidth
                                    justifyContent={isSmall ? "end" : "space-between"}
                                    direction="row"
                                    alignItems="flex-start"
                                    paddingBottom={isSmall ? "0" : "12px"}
                                >
                                    {(!isSmall) &&
                                        <Typography
                                            fontSize="18px"
                                            fontWeight="700"
                                            padding="0"
                                            color={theme.palette.text.primary}
                                            sx={{
                                                letterSpacing: '-0.54px',
                                                lineHeight: 1.1,
                                            }}
                                        >
                                            {t('Personal Details')}
                                        </Typography>
                                    }
                                    {isEditProfile === true ? (
                                        <Stack flexDirection="row" alignItems="center" marginTop={isSmall ? '0px' : '-5px'}>
                                            {!isSmall &&
                                                <Stack flexDirection="row" alignItems="center" sx={{ cursor: "pointer" }} onClick={() => dispatch(setEditProfile(false))}>
                                                    <IconButton sx={{ width: "30px", height: "30px", color: theme => theme.palette.primary.main }}>
                                                        <ArrowBackIosNewIcon sx={{ fontSize: "10px" }} />
                                                    </IconButton>
                                                    <Typography fontSize="13px" color={theme.palette.primary.main}>{t("Go Back")}</Typography>
                                                </Stack>
                                            }
                                            <IconButton onClick={handleClick} sx={{ padding: "0 0 0 16px" }}>
                                                <MoreDotIcon />
                                            </IconButton>
                                        </Stack>
                                    ) : (
                                        // Figma node 261:38739 — plain link-style
                                        // button (no border/fill): pencil icon
                                        // then label, in the theme's info color.
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            gap="6px"
                                            onClick={() =>
                                                dispatch(setEditProfile(true))
                                            }
                                            sx={{
                                                cursor: 'pointer',
                                                marginTop: isSmall
                                                    ? '0px'
                                                    : '-5px',
                                            }}
                                        >
                                            <i
                                                className="fi fi-rr-pencil"
                                                style={{
                                                    fontSize: '16px',
                                                    lineHeight: 1,
                                                    color: theme.palette.text
                                                        .info,
                                                }}
                                            />
                                            {!isSmall && (
                                                <Typography
                                                    sx={{
                                                        fontSize: '16px',
                                                        fontWeight: 500,
                                                        letterSpacing:
                                                            '-0.48px',
                                                    }}
                                                    color={
                                                        theme.palette.text
                                                            .info
                                                    }
                                                >
                                                    {t('Edit Profile')}
                                                </Typography>
                                            )}
                                        </Stack>
                                    )}
                                </CustomStackFullWidth>
                            </Grid>
                            {isEditProfile === true ? (
                                <EditProfile
                                    deleteUserHandler={deleteUserHandler}
                                    data={data?.data}
                                    refetch={refetch}
                                />
                            ) : (
                                <PersonalDetails
                                    data={data}
                                />
                            )}

                        </CustomPaperBigCard>
                        <CustomStackFullWidth>
                            {isEditProfile === false ? <MyAddresses /> : ""}
                        </CustomStackFullWidth>

                    </Stack>
                </CustomStackFullWidth>
            ) : (
                <CustomShimmerForProfile />
            )}
            <CustomPopover
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                handleClose={handleClose}
                maxWidth="265px"
            >
                <CustomStackFullWidth
                    justifyContent="center"
                    onClick={() => setDeleteModal(true)}
                    flexDirection="row"
                    alignItems="center"
                    gap="5px"
                    sx={{
                        cursor: "pointer"
                    }}
                >
                    <UserIcon />
                    <Typography fontSize="14px" fontWeight={500} color={theme.palette.text.secondary}>
                        {t("Delete Account")}
                    </Typography>
                </CustomStackFullWidth>
                {deleteModal &&
                    <DeleteAccount
                        handleClose={handleClose}
                        isLoading={deleteUserIsLoading}
                        deleteUserHandler={deleteUserHandler}
                    />
                }
            </CustomPopover>

        </>
    )
}

export default ProfilePage
