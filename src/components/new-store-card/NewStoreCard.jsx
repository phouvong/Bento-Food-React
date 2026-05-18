import { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation } from 'react-query'
import { toast } from 'react-hot-toast'
import moment from 'moment/moment'
import {
    Box,
    IconButton,
    Stack,
    Typography,
    alpha,
    styled,
} from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded'
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import PercentRoundedIcon from '@mui/icons-material/PercentRounded'

import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { useWishListResDelete } from '@/hooks/react-query/config/wish-list/useWishListResDelete'
import { addWishListRes, removeWishListRes } from '@/redux/slices/wishList'
import {
    DistanceCalculate,
    getReviewCount,
    handleRestaurantRedirect,
    restaurantDiscountTag,
} from '@/utils/customFunctions'
import CustomImageContainer from '@/components/CustomImageContainer'

const CardRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    width: '100%',
    transition: 'transform .2s ease',
    '&:hover': { transform: 'translateY(-2px)' },
    '&:hover .new-store-fav': { opacity: 1, transform: 'scale(1)' },
    '&:hover .new-store-media img': { transform: 'scale(1.04)' },
}))

const Media = styled(Box)(({ theme }) => ({
    position: 'relative',
    aspectRatio: '16 / 10',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.palette.neutral[200],
    marginBottom: 10,
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform .45s ease',
    },
}))

const StatusPill = styled(Box)(({ theme, isOpen }) => ({
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: '4px 10px',
    borderRadius: 9,
    fontSize: 10,
    fontWeight: 700,
    color: theme.palette.whiteText.main,
    backgroundColor: isOpen
        ? alpha(theme.palette.success.main, 0.92)
        : alpha("#000", 0.82),
    backdropFilter: 'blur(6px)',
    zIndex: 2,
    letterSpacing: '0.02em',
}))

const FavBtn = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'isactive',
})(({ theme, isactive }) => ({
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    color:
        isactive === 'true'
            ? theme.palette.error.main
            : theme.palette.text.secondary,
    boxShadow: theme.shadows[2],
    fontSize: 12,
    zIndex: 2,
    opacity: isactive === 'true' ? 1 : 0,
    transform: isactive === 'true' ? 'scale(1)' : 'scale(0.85)',
    transition: 'opacity .18s ease, transform .18s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        color: theme.palette.error.main,
    },
    '& svg': { fontSize: 16 },
    [theme.breakpoints.down('sm')]: {
        opacity: 1,
        transform: 'scale(1)',
    },
}))

const NameRow = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
}))

const Logo = styled(Box)(({ theme }) => ({
    width: 22,
    height: 22,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
}))

const NameText = styled(Typography)(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    fontSize: 13.5,
    fontWeight: 700,
    color: theme.palette.text.primary,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    
}))

const RatingBox = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    color: theme.palette.text.primary,
    '& svg': { fontSize: 14, color: theme.palette.warning.main },
}))

const CuisineLine = styled(Typography)(({ theme }) => ({
    fontSize: 11.5,
    fontWeight: 500,
    color: theme.palette.neutral[400],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: '0 0 5px',
}))

const MetaRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    fontSize: 11.5,
    fontWeight: 500,
    color: theme.palette.text.secondary,
    margin: '0 0 8px',
    flexWrap: 'wrap',
    '& svg': { fontSize: 13 },
}))

const MetaSep = styled(Box)(({ theme }) => ({
    width: 3,
    height: 3,
    borderRadius: '50%',
    backgroundColor: theme.palette.text.disabled,
}))

const FastFlag = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginInlineStart: 'auto',
    color: theme.palette.primary.main,
    '& svg': { fontSize: 14 },
}))

const OfferChip = styled(Stack)(({ theme }) => ({
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.palette.offerChip.bg,
    color: theme.palette.offerChip.text,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    '& svg': { fontSize: 12, color: theme.palette.offerChip.icon },
}))

const VerifiedTick = styled(VerifiedRoundedIcon)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.info.main,
    flexShrink: 0,
}))

const NewStoreCard = ({ restaurant }) => {
    const { t } = useTranslation()
    const router = useRouter()
    const dispatch = useDispatch()
    const { token } = useSelector((state) => state.userToken)
    const { wishLists } = useSelector((state) => state.wishList)
    const { global } = useSelector((state) => state.globalSettings)

    const [favLoading, setFavLoading] = useState(false)

    if (!restaurant) return null

    const {
        id,
        slug,
        name,
        logo_full_url,
        cover_photo_full_url,
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
        is_express,
    } = restaurant

    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

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
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint
    )
    const couponCode = coupons?.[0]?.code
    console.log({wishLists});
    

    const isInWishList = !!wishLists?.restaurant?.find((r) => r.id === id)

    const handleClick = () => {
        handleRestaurantRedirect(router, slug, id)
    }

    const { mutate: addFavoriteMutation } = useMutation(
        'new-store-card-fav',
        () => RestaurantsApi.addFavorite(id),
        {
            onSuccess: (res) => {
                if (res?.data) {
                    dispatch(
                        addWishListRes({
                            id,
                            logo_full_url,
                            name,
                            rating_count,
                            avg_rating,
                            delivery_time,
                        })
                    )
                    toast.success(t('Added to Wishlist successfully.'))
                }
                setFavLoading(false)
            },
            onError: (err) => {
                toast.error(err?.response?.data?.message || t('Error'))
                setFavLoading(false)
            },
        }
    )

    const { mutate: deleteFavoriteMutation } = useWishListResDelete((res) => {
        if (res) {
            dispatch(removeWishListRes(id))
            toast.success(t('Removed from  favorite successfully.'))
        }
        setFavLoading(false)
    })

    const toggleFavorite = (e) => {
        e.stopPropagation()
        if (!token) {
            toast.error(t('You are not logged in'))
            return
        }
        if (favLoading) return
        setFavLoading(true)
        if (isInWishList) {
            deleteFavoriteMutation(id)
        } else {
            addFavoriteMutation()
        }
    }
    console.log({isInWishList});
    

    return (
        <CardRoot onClick={handleClick}>
            <Media className="new-store-media">
                <CustomImageContainer
                    src={cover_photo_full_url}
                    alt={name}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    borderRadius="10px"
                />
                <FavBtn
                    className="new-store-fav"
                    onClick={toggleFavorite}
                    aria-label="wishlist"
                    isactive={isInWishList ? 'true' : 'false'}
                >
                    {isInWishList ? (
                        <FavoriteIcon sx={{ fontSize: 16, color: (theme) => theme.palette.error.main }} />
                    ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                    )}
                </FavBtn>
                <StatusPill isOpen={isOpen}>{statusText}</StatusPill>
            </Media>

            <NameRow>
                {logo_full_url && (
                    <Logo>
                        <CustomImageContainer
                            src={logo_full_url}
                            alt={name}
                            width="22px"
                            height="22px"
                            objectFit="cover"
                            borderRadius="50%"
                        />
                    </Logo>
                )}
                <NameText component="h4">
                    {name}
                    {verified && <VerifiedTick />}
                </NameText>
                {avg_rating > 0 && (
                    <RatingBox>
                        <StarRoundedIcon />
                        {Number(avg_rating).toFixed(1)}
                        {rating_count > 0 && (
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: 11,
                                    fontWeight: 500,
                                    color: (theme) =>
                                        theme.palette.neutral[400],
                                }}
                            >
                                {getReviewCount(rating_count)}
                            </Typography>
                        )}
                    </RatingBox>
                )}
            </NameRow>

            {cuisineNames.length > 0 && (
                <CuisineLine>{cuisineNames.join(' · ')}</CuisineLine>
            )}

            <MetaRow>
                {delivery_time && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap="3px"
                    >
                        <TwoWheelerOutlinedIcon />
                        <span>{delivery_time}</span>
                    </Stack>
                )}
                {(delivery_time && distance !== undefined) && <MetaSep />}
                {distance !== undefined && distance !== null && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap="3px"
                    >
                        <LocationOnOutlinedIcon />
                        <DistanceCalculate distance={distance} />
                    </Stack>
                )}
                {is_express && (
                    <FastFlag>
                        <BoltRoundedIcon />
                        <span>{t('Fast')}</span>
                    </FastFlag>
                )}
            </MetaRow>

            {(offerText || couponCode) && (
                <OfferChip>
                    <PercentRoundedIcon />
                    <span>{offerText || couponCode}</span>
                </OfferChip>
            )}
        </CardRoot>
    )
}

export default NewStoreCard
