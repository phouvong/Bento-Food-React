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
    Tooltip,
    Typography,
    alpha,
    styled,
} from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'

import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { useWishListResDelete } from '@/hooks/react-query/config/wish-list/useWishListResDelete'
import { addWishListRes, removeWishListRes } from '@/redux/slices/wishList'
import {
    getAmount,
    getReviewCount,
    handleRestaurantRedirect,
    restaurantDiscountShort,
} from '@/utils/customFunctions'
import CustomImageContainer from '@/components/CustomImageContainer'

const CardRoot = styled(Box)(() => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    width: '100%',
    '&:hover .img-gradient-overlay': { opacity: 1 },
}))

const Media = styled(Box)(({ theme }) => ({
    position: 'relative',
    aspectRatio: '2 / 1',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.palette.neutral[200],
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
}))

// Bottom scrim revealed on card hover — matches the Figma hover state
// (shadow sits inside the image, not as an outer card drop-shadow).
const ImgGradientOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    background: `linear-gradient(to bottom, ${alpha(
        theme.palette.common.black,
        0
    )} 11%, ${alpha(theme.palette.common.black, 0.55)} 100%)`,
    pointerEvents: 'none',
    zIndex: 1,
    opacity: 0,
    transition: 'opacity 0.3s ease',
}))

const StatusPill = styled(Box)(({ theme, isOpen }) => ({
    padding: '4px 10px',
    borderRadius: 9,
    fontSize: 10,
    fontWeight: 700,
    color: theme.palette.whiteText.main,
    backgroundColor: isOpen
        ? alpha(theme.palette.success.main, 0.92)
        : alpha(theme.palette.neutral[1000], 0.82),
    backdropFilter: 'blur(6px)',
    letterSpacing: '0.02em',
}))

const BottomRightBadges = styled(Stack)(() => ({
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
}))

const NewTag = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '2px 8px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.whiteText.main,
    backgroundColor: theme.palette.info.main,
    zIndex: 2,
}))

const AdTag = styled(Box)(({ theme }) => ({
    padding: '2px 6px',
    borderRadius: 9999,
    border: `1px solid ${alpha(theme.palette.common.black, 0.24)}`,
    backgroundColor: alpha(theme.palette.common.black, 0.7),
    color: theme.palette.neutral[200],
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.3,
}))

const FavBtn = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'isactive',
})(({ theme, isactive }) => ({
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    padding: 6,
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    color:
        isactive === 'true'
            ? theme.palette.error.main
            : theme.palette.text.secondary,
    boxShadow: `0px 1px 4px 0px ${alpha(theme.palette.common.black, 0.05)}`,
    fontSize: 12,
    zIndex: 2,
    '&:hover': {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.error.main,
    },
    '& svg': { fontSize: 15 },
}))

const InfoContainer = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingTop: 8,
    paddingLeft: 4,
    paddingRight: 4,
}))

const TitleRow = styled(Stack)(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
}))

const NameText = styled(Typography)(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.48px',
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
    alignItems: 'baseline',
    gap: 3,
    flexShrink: 0,
    '& i': {
        fontSize: 12,
        color: theme.palette.warning.main,
        position: 'relative',
        top: '1px',
    },
}))

const CuisineLine = styled(Typography)(({ theme }) => ({
    fontSize: 11.5,
    fontWeight: 500,
    color: theme.palette.neutral[400],
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}))

const MetaRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    flexWrap: 'wrap',
    '& svg': { fontSize: 12 },
    '& i': {
        fontSize: 12,
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
    },
}))

const MetaSep = styled(Box)(({ theme }) => ({
    width: 1,
    height: 10,
    backgroundColor: theme.palette.divider,
}))

const FastFlag = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginInlineStart: 'auto',
    color: theme.palette.primary.main,
    '& svg': { fontSize: 12 },
}))

const OfferChip = styled(Stack)(({ theme }) => ({
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.palette.error.pureRed,
    color: theme.palette.error.whiteText,
    padding: '2px 8px',
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 500,
    '& svg': { fontSize: 12, color: theme.palette.error.whiteText },
}))

const BogoChip = styled(Stack)(({ theme }) => ({
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.palette.error.back,
    color: theme.palette.error.pureRed,
    padding: '2px 6px',
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 600,
    '& i': {
        fontSize: 12,
        color: theme.palette.error.pureRed,
        display: 'inline-flex',
        alignItems: 'center',
        lineHeight: 1,
    },
}))

const ExtraOffersChip = styled(Stack)(({ theme }) => ({
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.neutral[200],
    color: theme.palette.neutral[400],
    padding: '2px 6px',
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 600,
}))

// ── isNewStore variant — compact logo-led card (Figma "Card/Restaurant") ──
const NewCardRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    width: '100%',
    height: '96px',
    boxSizing: 'border-box',
    gap: 8,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    padding: 16,
    [theme.breakpoints.up('md')]: {
        height: '100px',
    },
}))

// Outer wrapper stays overflow-visible so the rating pill (which hangs
// partially below the circle, per Figma) isn't clipped by the image mask.
const NewLogoOuter = styled(Box)(() => ({
    position: 'relative',
    width: 64,
    height: 64,
    flexShrink: 0,
}))

const NewLogoWrap = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.neutral[200],
}))

const NewRatingPill = styled(Stack)(({ theme }) => ({
    position: 'absolute',
    left: '50%',
    top: 46,
    transform: 'translateX(-50%)',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    height: 22,
    padding: '4px 6px',
    borderRadius: 999,
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)',
    whiteSpace: 'nowrap',
    zIndex: 1,
    '& i': {
        fontSize: 12,
        color: theme.palette.warning.main,
        position: 'relative',
        top: '1px',
    },
}))

const NewInfoContainer = styled(Box)(() => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
}))

const MAX_NEW_STORE_OFFER_SLOTS = 2

const NewStoreCard = ({ restaurant, isNewStore = false, onCardClick }) => {
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
        reviews_count,
        characteristics,
        cuisine,
        delivery_time,
        distance_label,
        delivery_fee,
        active,
        open,
        opening_time,
        discount,
        restaurant_discount,
        coupons,
        bogo_offers,
        verified_seller,
        is_express,
        is_new,
        ad,
        is_happy_hour_running,
        happy_hour,
    } = restaurant

    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    // Mirrors LatestRestaurantCard's delivery-fee rules: hide when the
    // restaurant is out of the delivery zone, when the fee is zero, or an
    // active order is in progress (not applicable on this card, so just
    // the first two).
    const showDeliveryFee =
        delivery_fee !== undefined &&
        delivery_fee !== null &&
        delivery_fee !== 'out_of_range' &&
        delivery_fee !== '0'
    const deliveryFeeText = showDeliveryFee
        ? delivery_fee === 'free_delivery'
            ? t('Free')
            : getAmount(
                  delivery_fee,
                  currencySymbolDirection,
                  currencySymbol,
                  0
              )
        : null

    const isOpen = active !== false && open !== 0
    const statusText = isOpen
        ? null
        : opening_time && opening_time !== 'closed'
        ? `${t('Open at')} ${moment(opening_time, 'HH:mm:ss').format(
              'hh:mm A'
          )}`
        : t('Closed Now')

    const cuisineNames =
        (characteristics && characteristics.length > 0 && characteristics) ||
        (cuisine && cuisine.length > 0 && cuisine.map((c) => c?.name || c)) ||
        []

    const reviewCount = reviews_count ?? rating_count

    const discountText = is_happy_hour_running && happy_hour?.discount
        ? restaurantDiscountShort(
              { discount: happy_hour.discount, discount_type: 'percent' },
              currencySymbolDirection,
              currencySymbol,
              digitAfterDecimalPoint
          )
        : restaurantDiscountShort(
              restaurant_discount ?? discount,
              currencySymbolDirection,
              currencySymbol,
              digitAfterDecimalPoint
          )

    const bogoOffers = bogo_offers ?? []
    const firstBogoOffer = bogoOffers[0]
    const bogoText = firstBogoOffer
        ? t('Buy {{buy}} Get {{get}} Free', {
              buy: firstBogoOffer?.buy_qty,
              get: firstBogoOffer?.get_qty,
          })
        : null

    // Coupons carry the same discount/discount_type shape as a restaurant
    // discount, so it renders as a value ("-10%", "-10৳") — never the raw
    // coupon code, which is meaningless to a user. Only shown on its own
    // when neither a discount nor a bogo offer already fills the row —
    // otherwise it folds into the "+N" overflow count below.
    const couponText =
        !discountText && !bogoText
            ? restaurantDiscountShort(
                  coupons?.[0],
                  currencySymbolDirection,
                  currencySymbol,
                  digitAfterDecimalPoint
              )
            : null

    const extraOffersCount = firstBogoOffer
        ? Math.max(0, bogoOffers.length - 1) + (coupons?.length ?? 0)
        : 0

    const isInWishList = !!wishLists?.restaurant?.find((r) => r.id === id)

    const handleClick = () => {
        onCardClick?.()
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

    if (isNewStore) {
        const offerChips = []
        if (discountText) {
            offerChips.push(
                <OfferChip key="discount">
                    <span>{discountText}</span>
                </OfferChip>
            )
        }
        if (bogoText) {
            offerChips.push(
                <BogoChip key="bogo">
                    <i className="fi fi-sr-badge-percent" />
                    <span>{bogoText}</span>
                </BogoChip>
            )
        } else if (couponText) {
            offerChips.push(
                <OfferChip key="coupon">
                    <span>{couponText}</span>
                </OfferChip>
            )
        }

        const slotsUsed = offerChips.length + (extraOffersCount > 0 ? 1 : 0)
        const visibleChips =
            slotsUsed > MAX_NEW_STORE_OFFER_SLOTS
                ? offerChips.slice(0, MAX_NEW_STORE_OFFER_SLOTS - 1)
                : offerChips
        const overflowCount =
            extraOffersCount + (offerChips.length - visibleChips.length)

        return (
            <NewCardRoot onClick={handleClick}>
                <NewLogoOuter>
                    <NewLogoWrap>
                        <CustomImageContainer
                            src={logo_full_url}
                            alt={name}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                        />
                    </NewLogoWrap>
                    {avg_rating > 0 && (
                        <NewRatingPill>
                            <i className="fi fi-sr-star" />
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 400,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.42px',
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
                                {Number(avg_rating).toFixed(1)}
                            </Typography>
                        </NewRatingPill>
                    )}
                </NewLogoOuter>

                <NewInfoContainer>
                    <NameText component="h4">
                        {name}
                        <VerifiedBadge
                            verified={verified_seller}
                            sx={{ mb: '1px' }}
                        />
                    </NameText>

                    {(delivery_time || distance_label) && (
                        <Stack direction="row" alignItems="center" gap="4px">
                            <AccessTimeOutlinedIcon
                                sx={{
                                    fontSize: 14,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            />
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            >
                                {delivery_time}
                                {distance_label && (
                                    <>
                                        {delivery_time ? ' (' : ''}
                                        {distance_label}
                                        {delivery_time ? ')' : ''}
                                    </>
                                )}
                            </Typography>
                        </Stack>
                    )}

                    {visibleChips.length > 0 && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            flexWrap="nowrap"
                            gap="4px"
                            sx={{
                                minWidth: 0,
                                overflow: 'hidden',
                                '& > *': { flexShrink: 0 },
                            }}
                        >
                            {visibleChips}
                            {overflowCount > 0 && (
                                <ExtraOffersChip>
                                    <span>+{overflowCount}</span>
                                </ExtraOffersChip>
                            )}
                        </Stack>
                    )}
                </NewInfoContainer>
            </NewCardRoot>
        )
    }

    return (
        <CardRoot onClick={handleClick}>
            <Media className="new-store-media">
                <CustomImageContainer
                    src={cover_photo_full_url}
                    alt={name}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    borderRadius="12px"
                    errorWidth={80}
                    errorHeight={80}
                />
                <ImgGradientOverlay className="img-gradient-overlay" />
                {is_new && <NewTag>{t('New')}</NewTag>}
                <FavBtn
                    onClick={toggleFavorite}
                    aria-label="wishlist"
                    isactive={isInWishList ? 'true' : 'false'}
                >
                    {isInWishList ? (
                        <FavoriteIcon
                            sx={{
                                fontSize: 16,
                                color: (theme) => theme.palette.error.main,
                            }}
                        />
                    ) : (
                        <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                    )}
                </FavBtn>
                {(Number(ad) === 1 || statusText) && (
                    <BottomRightBadges>
                        {Number(ad) === 1 && <AdTag>{t('AD')}</AdTag>}
                        {statusText && (
                            <StatusPill isOpen={isOpen}>
                                {statusText}
                            </StatusPill>
                        )}
                    </BottomRightBadges>
                )}
            </Media>

            <InfoContainer>
                <TitleRow>
                    <NameText component="h4">
                        {name}
                        <VerifiedBadge
                            verified={verified_seller}
                            sx={{ mb: '1px' }}
                        />
                    </NameText>
                    {avg_rating > 0 && (
                        <RatingBox>
                            <i className="fi fi-sr-star" />
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 400,
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.42px',
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
                                {Number(avg_rating).toFixed(1)}
                            </Typography>
                            {reviewCount > 0 && (
                                <Typography
                                    component="span"
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 400,
                                        letterSpacing: '-0.36px',
                                        color: (theme) =>
                                            theme.palette.text.secondary,
                                    }}
                                >
                                    {getReviewCount(reviewCount)}
                                </Typography>
                            )}
                        </RatingBox>
                    )}
                </TitleRow>

                {cuisineNames.length > 0 && (
                    <CuisineLine>{cuisineNames.join(' · ')}</CuisineLine>
                )}

                <MetaRow>
                    {(delivery_time || distance_label) && (
                        <Stack direction="row" alignItems="center" gap="4px">
                            <AccessTimeOutlinedIcon />
                            {delivery_time && <span>{delivery_time}</span>}
                            {distance_label && (
                                <span>
                                    {delivery_time ? '(' : ''}
                                    {distance_label}
                                    {delivery_time ? ')' : ''}
                                </span>
                            )}
                        </Stack>
                    )}
                    {(delivery_time || distance_label) &&
                        showDeliveryFee && <MetaSep />}
                    {showDeliveryFee && (
                        <Stack direction="row" alignItems="center" gap="4px">
                            <i className="fi fi-rr-biking-mountain" />
                            <span>{deliveryFeeText}</span>
                        </Stack>
                    )}
                    {is_express && (
                        <Tooltip title={t('Quick Delivery')} arrow>
                            <FastFlag>
                                <BoltRoundedIcon />
                                <span>{t('Fast')}</span>
                            </FastFlag>
                        </Tooltip>
                    )}
                </MetaRow>

                {(discountText || bogoText || couponText) && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        flexWrap="wrap"
                        gap="4px"
                    >
                        {discountText && (
                            <OfferChip>
                                <span>{discountText}</span>
                            </OfferChip>
                        )}
                        {bogoText ? (
                            <BogoChip>
                                <i className="fi fi-sr-badge-percent" />
                                <span>{bogoText}</span>
                            </BogoChip>
                        ) : (
                            couponText && (
                                <OfferChip>
                                    <span>{couponText}</span>
                                </OfferChip>
                            )
                        )}
                        {extraOffersCount > 0 && (
                            <ExtraOffersChip>
                                <span>+{extraOffersCount}</span>
                            </ExtraOffersChip>
                        )}
                    </Stack>
                )}
            </InfoContainer>
        </CardRoot>
    )
}

export default NewStoreCard
