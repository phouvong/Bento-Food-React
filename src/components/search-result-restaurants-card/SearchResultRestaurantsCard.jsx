import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Box, Stack, Typography, alpha, styled, useTheme } from '@mui/material'
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'

import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'
import CustomImageContainer from '@/components/CustomImageContainer'
import {
    BadgeRow,
    TypeBadge,
    PriceNow,
    PriceOld,
} from '@/components/new-food-card/NewFoodCardShared'
import {
    ProductVegSvg,
    ProductNonVegSvg,
} from '@/components/new-food-card/ProductBadgeIcons'
import {
    getAmount,
    getConvertDiscount,
    handleRestaurantRedirect,
    restaurantDiscountShort,
} from '@/utils/customFunctions'

const CardRoot = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: 16,
    paddingBlock: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    cursor: 'pointer',
    width: '100%',
    maxWidth: 340,
    boxSizing: 'border-box',
    overflow: 'hidden',
    boxShadow: '0px 1px 4px 0px rgba(0,0,0,0.05)',
    transition: 'box-shadow .2s ease',
    '&:hover': {
        boxShadow:
            '0px 4px 4px -4px rgba(0,0,0,0.05), 0px 16px 32px -4px rgba(0,0,0,0.05)',
    },
}))

const LogoWrap = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: 64,
    height: 64,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: theme.palette.neutral[200],
}))

const AdBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: 2,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: alpha(theme.palette.neutral[1000], 0.82),
    border: `1px solid ${alpha(theme.palette.neutral[1000], 0.24)}`,
    borderRadius: 9999,
    padding: '2px 6px',
}))

const Pill = styled(Stack)(({ theme, bg }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: bg || theme.palette.error.pureRed,
    borderRadius: 24,
    padding: '2px 6px',
    flexShrink: 0,
    '& svg': { fontSize: 12 },
}))

const ItemThumb = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: theme.palette.neutral[1800],
    border: `1px solid ${theme.palette.divider}`,
}))

// Scrolls on its own axis rather than clipping — the 4-item strip is wider
// than the card's content box even at the 340px max width, and narrower
// still on small phones (320px viewports).
// Left padding only — no right padding, so the row can bleed to the card's
// right edge instead of leaving a dead gap after the last item.
const ItemsRow = styled(Box)({
    width: '100%',
    display: 'flex',
    gap: 12,
    paddingInlineStart: 16,
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
})

// Compact 88px item card for the row beneath the restaurant header.
const FoodItemPreview = ({
    item,
    global,
    currencySymbolDirection,
    currencySymbol,
    digitAfterDecimalPoint,
}) => {
    const discountedPrice = getConvertDiscount(
        item?.discount,
        item?.discount_type,
        item?.price
    )
    const hasDiscount = item?.discount > 0 && discountedPrice !== item?.price
    const showVegBadge = global?.toggle_veg_non_veg === true

    return (
        <Box
            sx={{
                width: 84,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <ItemThumb>
                <CustomImageContainer
                    src={item?.image_full_url || item?.thumbnail_full_url}
                    alt={item?.name}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                />
                {showVegBadge && (
                    <BadgeRow sx={{ top: 6, left: 6 }}>
                        <TypeBadge sx={{ width: 20, height: 20 }}>
                            {item?.veg === 1 ? (
                                <ProductVegSvg />
                            ) : (
                                <ProductNonVegSvg />
                            )}
                        </TypeBadge>
                    </BadgeRow>
                )}
            </ItemThumb>
            <Stack sx={{ pt: '12px', px: '4px', gap: '6px' }}>
                <Typography
                    sx={{
                        fontSize: 12,
                        fontWeight: 400,
                        color: (theme) => theme.palette.text.secondary,
                        lineHeight: 1.2,
                        letterSpacing: '-0.36px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item?.name}
                </Typography>
                <Stack
                    direction="row"
                    alignItems="center"
                    gap="4px"
                    flexWrap="wrap"
                    sx={{ py: '2px' }}
                >
                    <PriceNow sx={{ fontSize: 18 }}>
                        {getAmount(
                            discountedPrice,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </PriceNow>
                    {hasDiscount && (
                        <PriceOld sx={{ fontSize: 14 }}>
                            {getAmount(
                                item?.price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </PriceOld>
                    )}
                </Stack>
            </Stack>
        </Box>
    )
}

// "All" tab restaurants row (Figma node 254:81052) — restaurant header with
// delivery info + discount badges, plus a preview strip of the restaurant's
// menu items. Reuses NewStoreCard's redirect/discount helpers; visually
// distinct because the Figma card leads with items instead of a cover photo.
const SearchResultRestaurantsCard = ({ restaurant, showAdBadge = false }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const { global } = useSelector((state) => state.globalSettings)

    if (!restaurant) return null

    const {
        id,
        slug,
        name,
        logo_full_url,
        delivery_time,
        distance_label,
        discount,
        restaurant_discount,
        coupons,
        free_delivery,
        verified_seller,
        foods,
    } = restaurant

    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const discountText = restaurantDiscountShort(
        restaurant_discount ?? discount,
        currencySymbolDirection,
        currencySymbol,
        digitAfterDecimalPoint
    )

    const badges = []
    if (discountText) badges.push({ key: 'discount', text: discountText })
    if (free_delivery) {
        badges.push({
            key: 'free-delivery',
            text: t('Free Delivery'),
            icon: (
                <DeliveryDiningOutlinedIcon
                    sx={{ color: theme.palette.error.pureRed }}
                />
            ),
            bg: theme.palette.error.back,
            color: theme.palette.error.pureRed,
        })
    }
    const couponCount = coupons?.length || 0
    if (couponCount > 0) {
        badges.push({
            key: 'coupon',
            text: `${couponCount} ${couponCount > 1 ? t('Coupons') : t('Coupon')}`,
            bg: theme.palette.neutral[200],
            color: theme.palette.text.secondary,
        })
    }
    const visibleBadges = badges.slice(0, 2)
    const overflowCount = badges.length - visibleBadges.length

    const previewItems = (foods || []).slice(0, 4)

    const handleClick = () => handleRestaurantRedirect(router, slug, id)

    return (
        <CardRoot onClick={handleClick}>
            <Stack
                direction="row"
                alignItems="center"
                gap="8px"
                width="100%"
                sx={{ paddingInline: '16px' }}
            >
                <Stack flex={1} minWidth={0} gap="6px">
                    <Typography
                        sx={{
                            fontSize: 16,
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-0.48px',
                            color: (theme) => theme.palette.text.primary,
                            textTransform: 'capitalize',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        {name}
                        <VerifiedBadge verified={verified_seller} size={14} />
                    </Typography>

                    {(delivery_time || distance_label) && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap="4px"
                            sx={{ pb: '2px' }}
                        >
                            <AccessTimeOutlinedIcon
                                sx={{
                                    fontSize: 13,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                    whiteSpace: 'nowrap',
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

                    {visibleBadges.length > 0 && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap="4px"
                            flexWrap="wrap"
                        >
                            {visibleBadges.map((b) => (
                                <Pill key={b.key} bg={b.bg}>
                                    {b.icon}
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color:
                                                b.color ||
                                                theme.palette.error.whiteText,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {b.text}
                                    </Typography>
                                </Pill>
                            ))}
                            {overflowCount > 0 && (
                                <Pill bg={theme.palette.neutral[200]}>
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: theme.palette.text
                                                .secondary,
                                        }}
                                    >
                                        +{overflowCount}
                                    </Typography>
                                </Pill>
                            )}
                        </Stack>
                    )}
                </Stack>

                <LogoWrap>
                    <CustomImageContainer
                        src={logo_full_url}
                        alt={name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                    />
                    {showAdBadge && (
                        <AdBadge>
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: (theme) =>
                                        theme.palette.whiteText.main,
                                    lineHeight: 1.3,
                                }}
                            >
                                {t('AD')}
                            </Typography>
                        </AdBadge>
                    )}
                </LogoWrap>
            </Stack>

            {previewItems.length > 0 && (
                <ItemsRow>
                    {previewItems.map((item) => (
                        <FoodItemPreview
                            key={item?.id}
                            item={item}
                            global={global}
                            currencySymbolDirection={currencySymbolDirection}
                            currencySymbol={currencySymbol}
                            digitAfterDecimalPoint={digitAfterDecimalPoint}
                        />
                    ))}
                </ItemsRow>
            )}
        </CardRoot>
    )
}

export default SearchResultRestaurantsCard
