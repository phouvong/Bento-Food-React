import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CloseIcon from '@mui/icons-material/Close'
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining'
import StarIcon from '@mui/icons-material/Star'
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import CustomNextImage from '@/components/CustomNextImage'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'
import {
    getAmount,
    getNumberWithConvertedDecimalPoint,
} from '@/utils/customFunctions'
import {
    ProductHalalSvg,
    ProductNonVegSvg,
    ProductVegSvg,
} from '../new-food-card/ProductBadgeIcons'
import { rawFoodDataNormalize } from '../new-food-card/rawFoodDataNormalize'

const FoodModalTopSection = ({
    product,
    image,
    handleModalClose,
    isInList,
    addToFavorite,
    deleteWishlistItem,
    global,
    selectedOptions,
}) => {
    const router = useRouter()
    const theme = useTheme()
    const { t } = useTranslation()

    const handleClick = () => {
        router.push(
            `/restaurants/${product?.restaurant_slug || product?.restaurant_id}`
        )
        handleModalClose()
    }

    // Restaurant logo is nested on the food-details payload.
    const restaurantLogo =
        product?.restaurant_category?.restaurant?.logo_full_url

    // Verified flag name varies by endpoint.
    const isVerified =
        product?.restaurant_verified ??
        product?.verified_seller ??
        product?.is_verified

    // review count key varies (rating_count on lists, review_count on details).
    const reviewCount = product?.rating_count ?? product?.review_count ?? 0
    const hasRating = !product?.available_date_ends && reviewCount > 0
    const favorited = isInList(product?.id)

    // ── Price (rendered here so it can be black, not StartPriceView's orange) ──
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    const { discountedPrice: finalPrice, hasDiscount } =
        rawFoodDataNormalize(product)
    const isOutOfStock =
        product?.item_stock === 0 &&
        (!selectedOptions || selectedOptions?.length === 0) &&
        product?.stock_type !== 'unlimited'
    const showDiscountBadge =
        Number.parseInt(product?.discount) > 0 &&
        product?.discount_type === 'percent'

    return (
        <CustomStackFullWidth>
            {/* ── Image ── */}
            <Box sx={{ position: 'relative', width: '100%' }}>
                <IconButton
                    onClick={handleModalClose}
                    aria-label={t('Close')}
                    sx={{
                        zIndex: 3,
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        padding: '5px',
                        backgroundColor:  '#fff',
                        color:'rgba(0, 0, 0, 0.5)',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.68)' },
                    }}
                >
                    <CloseIcon sx={{ fontSize: '16px' }} />
                </IconButton>

                <Box
                    sx={{
                        width: '100%',
                        // Fixed 2:1 banner so the header keeps its height even
                        // when the photo is missing.
                        aspectRatio: '2 / 1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: '5px 5px 0 0',
                        lineHeight: 0,
                        backgroundColor: theme.palette.neutral[200],
                        // A missing/broken photo falls back to a 432×420
                        // placeholder that renders at its intrinsic size; cap
                        // it so it sits centred instead of spilling out of the
                        // banner top-left.
                        '& img': { maxWidth: '100%', maxHeight: '100%' },
                    }}
                >
                    <CustomNextImage
                        src={image}
                        width="600"
                        height="300"
                        objectFit={image ? 'cover' : 'contain'}
                        errorWidth={80}
                        errorHeight={80}
                        alt={product?.name || 'Food Image'}
                    />
                </Box>

                {/* Favorite — white rounded button straddling image bottom */}
                {!product?.available_date_ends && (
                    <IconButton
                        onClick={
                            favorited
                                ? () => deleteWishlistItem(product?.id)
                                : addToFavorite
                        }
                        aria-label={t('Favorite')}
                        sx={{
                            zIndex: 3,
                            position: 'absolute',
                            bottom: 10,
                            right: 6,
                            width: 35,
                            height: 35,
                            borderRadius: '12px',
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.14)',
                            '&:hover': {
                                backgroundColor: theme.palette.background.paper,
                            },
                            // Flaticon glyphs, same set the new food cards use
                            // for their wishlist button.
                            '& i': {
                                fontSize: '18px',
                                lineHeight: 0,
                                color: favorited
                                    ? theme.palette.primary.main
                                    : theme.palette.neutral[600],
                            },
                        }}
                    >
                        <i
                            className={
                                favorited ? 'fi fi-sr-heart' : 'fi fi-rr-heart'
                            }
                        />
                    </IconButton>
                )}
            </Box>

            {/* ── Info ── */}
            <Stack
                spacing={0.5}
                sx={{ px: { xs: 1.5, md: 2 }, pt: 1.5, pb: 0.5 }}
            >
                {/* Restaurant */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    sx={{ minWidth: 0 }}
                >
                    {restaurantLogo && (
                        <Box
                            sx={{
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}
                        >
                            <CustomNextImage
                                src={restaurantLogo}
                                width={18}
                                height={18}
                                objectFit="cover"
                                alt={product?.restaurant_name}
                            />
                        </Box>
                    )}
                    <Typography
                        onClick={handleClick}
                        noWrap
                        sx={{
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            // neutral gray (#6B7280), not the theme's
                            // blue-slate text.secondary (#65748B).
                            color: theme.palette.neutral[500],
                            '&:hover': { color: theme.palette.primary.main },
                        }}
                    >
                        {product?.restaurant_name}
                    </Typography>
                    <VerifiedBadge
                        verified={isVerified}
                        size={15}
                        sx={{ mb: '1px' }}
                    />
                </Stack>

                {/* Title */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                    flexWrap="wrap"
                >
                    <Typography
                        component="h2"
                        // The modal watches this element to decide when to
                        // show its compact sticky header.
                        id="food-modal-title"
                        sx={{
                            fontSize: { xs: '18px', md: '20px' },
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            lineHeight: 1.25,
                        }}
                    >
                        {product?.name}
                    </Typography>
                    {/* Same veg / non-veg marks the new food cards use. */}
                    {global?.toggle_veg_non_veg ? (
                        Number(product?.veg) === 1 ? (
                            <ProductVegSvg />
                        ) : (
                            <ProductNonVegSvg />
                        )
                    ) : null}
                    {/* Halal — moved up next to the name from the details
                        section below. */}
                    {product?.halal_tag_status === 1 &&
                        product?.is_halal === 1 && (
                            <Tooltip arrow title={t('This is a halal food')}>
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        lineHeight: 0,
                                    }}
                                >
                                    <ProductHalalSvg />
                                </Box>
                            </Tooltip>
                        )}
                </Stack>

                {/* Rating */}
                {hasRating && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <StarIcon
                            sx={{
                                fontSize: '14px',
                                color: theme.palette.warning.main,
                            }}
                        />
                        <Typography
                            sx={{ fontSize: '13px', fontWeight: 400 }}
                            color={theme.palette.text.primary}
                        >
                            {getNumberWithConvertedDecimalPoint(
                                product?.avg_rating,
                                1
                            )}
                        </Typography>
                        <Typography
                            sx={{ fontSize: '12px' }}
                            color={theme.palette.neutral[500]}
                        >
                            ({reviewCount}{' '}
                            {reviewCount > 1 ? t('Reviews') : t('Review')})
                        </Typography>
                    </Stack>
                )}

                {/* Price */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    flexWrap="wrap"
                >
                    <Typography
                        component="p"
                        sx={{
                            fontSize: { xs: '18px', md: '20px' },
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                        }}
                    >
                        {getAmount(
                            finalPrice,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </Typography>
                    {hasDiscount && (
                        <Typography
                            component="del"
                            sx={{
                                fontSize: '15px',
                                fontWeight: 400,
                                color: theme.palette.neutral[500],
                            }}
                        >
                            {getAmount(
                                product?.price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
                    )}
                    {isOutOfStock && (
                        <Box
                            sx={{
                                px: 1.25,
                                py: '3px',
                                // Match the discount tag: solid red pill, white text.
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#fff',
                                backgroundColor: theme.palette.error.main,
                            }}
                        >
                            {t('Out Of Stock')}
                        </Box>
                    )}
                </Stack>

                {/* Discount / free badges */}
                {showDiscountBadge || product?.free_delivery ? (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        flexWrap="wrap"
                    >
                        {showDiscountBadge && (
                            <Box
                                sx={{
                                    px: 1.25,
                                    py: '3px',
                                    // Full pill (stadium) — matches the tag.
                                    borderRadius: '999px',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    // Solid red pill with white text.
                                    color: '#fff',
                                    backgroundColor: theme.palette.error.main,
                                }}
                            >
                                -{product?.discount}%
                            </Box>
                        )}
                        {product?.free_delivery ? (
                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.25}
                                sx={{
                                    pl: 0.5,
                                    pr: 1,
                                    py: '3px',
                                    borderRadius: '8px',
                                    color: theme.palette.success.main,
                                    backgroundColor: 'rgba(1, 148, 99, 0.12)',
                                }}
                            >
                                <DeliveryDiningIcon sx={{ fontSize: '15px' }} />
                                <Typography
                                    component="span"
                                    sx={{ fontSize: '12px', fontWeight: 700 }}
                                >
                                    {t('Free')}
                                </Typography>
                            </Stack>
                        ) : null}
                    </Stack>
                ) : null}
            </Stack>
        </CustomStackFullWidth>
    )
}

export default FoodModalTopSection
