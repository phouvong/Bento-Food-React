import React, { useState } from 'react'
import {
    Box,
    IconButton,
    Stack,
    Typography,
    alpha,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PercentRoundedIcon from '@mui/icons-material/PercentRounded'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment/moment'

import { WishlistBox } from './WishList.style'
import CustomImageContainer from '../CustomImageContainer'
import CustomPopover from '../custom-popover/CustomPopover'
import WishListImage from '../../assets/images/WishListImage'
import CustomPopoverWithItem from '../custom-popover/CustomPopoverWithItem'
import DeleteIcon from '../../assets/images/icons/DeleteIcon'
import {
    DistanceCalculate,
    handleRestaurantRedirect,
    restaurantDiscountTag,
} from '@/utils/customFunctions'

const WishListRestaurantCard = ({ restaurant, deleteWishlistRes }) => {
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const router = useRouter()
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)

    const [anchorEl, setAnchorEl] = useState(null)

    const {
        id,
        name,
        slug,
        logo_full_url,
        address,
        avg_rating,
        rating_count,
        characteristics,
        cuisine,
        delivery_time,
        distance,
        free_delivery,
        active,
        open,
        opening_time,
        discount,
        restaurant_discount,
        coupons,
        verified,
    } = restaurant

    const handleClick = () => {
        deleteWishlistRes(id)
    }
    const handleClickDelete = (event) => {
        event.stopPropagation()
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => setAnchorEl(null)

    const routeToRestaurant = () => {
        handleRestaurantRedirect(router, slug, id)
    }

    const isOpen = active !== false && open !== 0
    const statusText = isOpen
        ? t('Open')
        : opening_time && opening_time !== 'closed'
          ? `${t('Open at')} ${moment(opening_time, 'HH:mm:ss').format('hh:mm A')}`
          : t('Closed Now')

    const cuisineNames =
        (characteristics && characteristics.length > 0 && characteristics) ||
        (cuisine && cuisine.length > 0 && cuisine.map((c) => c?.name || c)) ||
        []

    const offerText = restaurantDiscountTag(
        restaurant_discount ?? discount,
        free_delivery,
        global?.currency_symbol_direction,
        global?.currency_symbol,
        global?.digit_after_decimal_point
    )
    const couponCode = coupons?.[0]?.code

    const imageSize = isXSmall ? 84 : 110

    return (
        <WishlistBox
            sx={{
                cursor: 'pointer',
                p: { xs: 1.25, sm: 1.5 },
                transition: 'transform .2s ease, box-shadow .2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 22px ${alpha(
                        theme.palette.primary.main,
                        0.1
                    )}`,
                },
            }}
            onClick={routeToRestaurant}
        >
            <Stack
                direction="row"
                spacing={{ xs: 1.25, sm: 2 }}
                alignItems="center"
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: imageSize,
                        height: imageSize,
                        flexShrink: 0,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: theme.palette.neutral[200],
                    }}
                >
                    <CustomImageContainer
                        src={logo_full_url}
                        alt={name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        borderRadius="12px"
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 6,
                            left: 6,
                            px: 0.9,
                            py: 0.3,
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            color: theme.palette.whiteText?.main || '#fff',
                            backgroundColor: isOpen
                                ? alpha(theme.palette.success.main, 0.95)
                                : alpha(theme.palette.text.primary, 0.85),
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        {statusText}
                    </Box>
                </Box>

                <Stack flex={1} minWidth={0} spacing={0.6}>
                    <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={1}
                    >
                        <Stack flex={1} minWidth={0} spacing={0.4}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                            >
                                <Typography
                                    component="h4"
                                    sx={{
                                        fontSize: { xs: 14, sm: 15.5 },
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {name}
                                </Typography>
                                {verified && (
                                    <VerifiedRoundedIcon
                                        sx={{
                                            fontSize: 14,
                                            color: theme.palette.info.main,
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                            </Stack>

                            {cuisineNames.length > 0 ? (
                                <Typography
                                    sx={{
                                        fontSize: 11.5,
                                        fontWeight: 500,
                                        color: theme.palette.neutral[400],
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {cuisineNames.join(' · ')}
                                </Typography>
                            ) : address ? (
                                <Typography
                                    sx={{
                                        fontSize: 11.5,
                                        fontWeight: 500,
                                        color: theme.palette.neutral[400],
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {address}
                                </Typography>
                            ) : null}
                        </Stack>

                        <IconButton
                            onClick={handleClickDelete}
                            sx={{
                                width: 32,
                                height: 32,
                                flexShrink: 0,
                                borderRadius: '8px',
                                color: theme.palette.error.main,
                                backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.08
                                ),
                                '&:hover': {
                                    backgroundColor: alpha(
                                        theme.palette.error.main,
                                        0.16
                                    ),
                                },
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Stack>

                    <Stack
                        direction="row"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                        sx={{
                            fontSize: 11.5,
                            color: theme.palette.text.secondary,
                            '& svg': { fontSize: 14 },
                        }}
                    >
                        {Number(avg_rating) > 0 && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.25}
                                sx={{ color: theme.palette.text.primary }}
                            >
                                <StarRoundedIcon
                                    sx={{
                                        color: theme.palette.warning.main,
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                    }}
                                >
                                    {Number(avg_rating).toFixed(1)}
                                </Typography>
                                {rating_count > 0 && (
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontSize: 11,
                                            color: theme.palette.neutral[400],
                                        }}
                                    >
                                        ({rating_count})
                                    </Typography>
                                )}
                            </Stack>
                        )}
                        {delivery_time && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.4}
                            >
                                <TwoWheelerOutlinedIcon />
                                <span>{delivery_time}</span>
                            </Stack>
                        )}
                        {distance !== undefined && distance !== null && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.4}
                            >
                                <LocationOnOutlinedIcon />
                                <DistanceCalculate distance={distance} />
                            </Stack>
                        )}
                    </Stack>

                    {(offerText || couponCode) && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                alignSelf: 'flex-start',
                                px: 1.25,
                                py: 0.4,
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor:
                                    theme.palette.offerChip?.bg ||
                                    alpha(theme.palette.primary.main, 0.1),
                                color:
                                    theme.palette.offerChip?.text ||
                                    theme.palette.primary.main,
                                '& svg': {
                                    fontSize: 12,
                                    color:
                                        theme.palette.offerChip?.icon ||
                                        theme.palette.primary.main,
                                },
                            }}
                        >
                            <PercentRoundedIcon />
                            <span>{offerText || couponCode}</span>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            <CustomPopover
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                maxWidth="421px"
                padding="20px 35px 25px"
            >
                <CustomPopoverWithItem
                    icon={<WishListImage />}
                    deleteItem={handleClick}
                    handleClose={handleClose}
                    confirmButtonText="Remove"
                    cancelButtonText="Cancel"
                    title="Remove this restaurant"
                    subTitle="Are you sure you want to  delete this item?"
                />
            </CustomPopover>
        </WishlistBox>
    )
}

export default WishListRestaurantCard
