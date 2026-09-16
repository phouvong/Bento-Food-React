import { useTranslation } from 'react-i18next'
import { Box, IconButton, Stack, Tooltip, Typography, alpha, styled, useTheme } from '@mui/material'

import { getAmount } from '@/utils/customFunctions'
import CustomImageContainer from '@/components/CustomImageContainer'
import {
    ProductHalalSvg,
    ProductVegSvg,
    ProductNonVegSvg,
} from '@/components/new-food-card/ProductBadgeIcons'
import CircularLoader from '@/components/loader/CircularLoader'
import {
    MediaInner,
    ImgGradientOverlay,
    UnavailableOverlay,
    UnavailableText,
    BadgeRow,
    TypeBadge,
    RatingInline,
    WishBtn,
    AddFab,
    StoreRow,
    StoreNameGroup,
    StoreName,
    ProviderBadge,
    TitleText,
    PriceRow,
    PriceNow,
    PriceOld,
    DiscountChip,
} from '@/components/new-food-card/NewFoodCardShared'

const CardRoot = styled(Box)(() => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    width: '100%',
    '&:hover .new-food-wish': {
        opacity: 1,
        transform: 'scale(1)',
    },
    '&:hover .img-gradient-overlay': { opacity: 1 },
}))

const Media = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.neutral[200],
    marginBottom: 10,
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: 12,
    },
}))

// Presentational only — all state, mutations, and handlers live in
// NewFoodCard.jsx and are passed down as props so this file stays UI-only.
const NewFoodCardVertical = ({
    product,
    imageUrl,
    available,
    showVegBadge,
    showHalalBadge,
    providerVerified,
    providerLogoUrl,
    isInList,
    addToFavorite,
    deleteWishlistItem,
    isInCart,
    incrOpen,
    setIncrOpen,
    setOpenModal,
    addToCart,
    addToCartLoading,
    handleIncrement,
    handleDecrement,
    handleRemove,
    updatedLoading,
    removeIsLoading,
    getQuantity,
    discountedPrice,
    hasDiscount,
    discountBadgeText,
    currencySymbolDirection,
    currencySymbol,
    digitAfterDecimalPoint,
    onCardClick,
}) => {
    const { t } = useTranslation()
    const theme = useTheme()

    return (
        <CardRoot onClick={onCardClick}>
            <Media className="new-food-media">
                <MediaInner>
                    <CustomImageContainer
                        src={imageUrl}
                        alt={product?.name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        borderRadius="12px"
                        errorWidth={80}
                        errorHeight={80}
                    />
                    <ImgGradientOverlay className="img-gradient-overlay" />
                    {!available && (
                        <UnavailableOverlay>
                            <UnavailableText>
                                {t('Not Available Now')}
                            </UnavailableText>
                        </UnavailableOverlay>
                    )}
                </MediaInner>

                {(showVegBadge || showHalalBadge) && (
                    <BadgeRow>
                        {showVegBadge && (
                            <Tooltip
                                title={
                                    product?.veg === 1
                                        ? t('This is a veg food')
                                        : t('This is a non veg food')
                                }
                                arrow
                            >
                                <TypeBadge>
                                    {product?.veg === 1 ? (
                                        <ProductVegSvg />
                                    ) : (
                                        <ProductNonVegSvg />
                                    )}
                                </TypeBadge>
                            </Tooltip>
                        )}
                        {showHalalBadge && (
                            <Tooltip title={t('This is a halal food')} arrow>
                                <TypeBadge>
                                    <ProductHalalSvg />
                                </TypeBadge>
                            </Tooltip>
                        )}
                    </BadgeRow>
                )}

                <WishBtn
                    className="new-food-wish"
                    onClick={isInList ? deleteWishlistItem : addToFavorite}
                    aria-label="wishlist"
                    isactive={isInList ? 'true' : 'false'}
                >
                    <i
                        className={
                            isInList ? 'fi fi-sr-heart' : 'fi fi-rr-heart'
                        }
                        style={
                            isInList
                                ? { color: theme.palette.error.main }
                                : undefined
                        }
                    />
                </WishBtn>

                {available && !isInCart && (
                    <AddFab
                        onClick={addToCart}
                        disabled={addToCartLoading}
                        aria-label="add to cart"
                    >
                        <i className="fi fi-br-plus" />
                    </AddFab>
                )}

                {available &&
                    isInCart &&
                    (product?.variations?.length > 0 || !incrOpen ? (
                        <AddFab
                            onClick={(e) => {
                                e.stopPropagation()
                                if (product?.variations?.length > 0) {
                                    setOpenModal(true)
                                } else {
                                    setIncrOpen(true)
                                }
                            }}
                            aria-label="quantity"
                            sx={{
                                backgroundColor: (theme) =>
                                    theme.palette.primary.main,
                                color: (theme) =>
                                    theme.palette.primary.contrastText,
                                fontSize: 12,
                                fontWeight: 700,
                                '&:hover': {
                                    backgroundColor: (theme) =>
                                        theme.palette.primary.dark,
                                    color: (theme) =>
                                        theme.palette.primary.contrastText,
                                },
                            }}
                        >
                            {getQuantity(product?.id)}
                        </AddFab>
                    ) : (
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={() => setIncrOpen(true)}
                            sx={{
                                position: 'absolute',
                                left: '50%',
                                bottom: 9,
                                transform: 'translateX(-50%)',
                                width: 'auto',
                                padding: '3px 4px',
                                borderRadius: '999px',
                                backgroundColor: (theme) =>
                                    theme.palette.background.paper,
                                border: (theme) =>
                                    `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                                boxShadow: (theme) => theme.shadows[2],
                                zIndex: 4,
                                gap: '6px',
                            }}
                        >
                            {isInCart?.quantity === 1 ? (
                                <IconButton
                                    disabled={removeIsLoading}
                                    size="small"
                                    aria-label="remove"
                                    onClick={handleRemove}
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        padding: 0,
                                        color: (theme) =>
                                            theme.palette.error.main,
                                        '& i': {
                                        fontSize: 13,
                                        lineHeight: 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                    }}
                                >
                                    <i className="fi fi-rr-trash" />
                                </IconButton>
                            ) : (
                                <IconButton
                                    disabled={updatedLoading}
                                    size="small"
                                    aria-label="decrement"
                                    onClick={handleDecrement}
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        padding: 0,
                                        backgroundColor: (theme) =>
                                            alpha(theme.palette.primary.main, 0.5),
                                        color: (theme) =>
                                            theme.palette.primary.contrastText,
                                        '&:hover': {
                                            backgroundColor: (theme) =>
                                                theme.palette.primary.dark,
                                        },
                                        '& i': {
                                        fontSize: 13,
                                        lineHeight: 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                    }}
                                >
                                    <i className="fi fi-rr-minus" />
                                </IconButton>
                            )}

                            {updatedLoading ? (
                                <CircularLoader size="12px" />
                            ) : (
                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: (theme) =>
                                            theme.palette.text.primary,
                                        lineHeight: 1,
                                        minWidth: 18,
                                        textAlign: 'center',
                                        fontVariantNumeric: 'tabular-nums',
                                        fontFeatureSettings: '"tnum"',
                                    }}
                                >
                                    {getQuantity(product?.id)}
                                </Typography>
                            )}

                            <IconButton
                                disabled={updatedLoading}
                                size="small"
                                aria-label="increment"
                                onClick={handleIncrement}
                                sx={{
                                    width: 22,
                                    height: 22,
                                    padding: 0,
                                    backgroundColor: (theme) =>
                                        theme.palette.primary.main,
                                    color: (theme) =>
                                        theme.palette.primary.contrastText,
                                    '&:hover': {
                                        backgroundColor: (theme) =>
                                            theme.palette.primary.dark,
                                    },
                                    '& i': {
                                        fontSize: 13,
                                        lineHeight: 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                }}
                            >
                                <i className="fi fi-br-plus" />
                            </IconButton>
                        </Stack>
                    ))}
            </Media>

            <Box sx={{ px: '2px' }}>
                <StoreRow>
                    {product?.restaurant_name && (
                        <StoreNameGroup>
                            <ProviderBadge
                                verified={providerVerified}
                                logoUrl={providerLogoUrl}
                                name={product.restaurant_name}
                            />
                            <StoreName>{product.restaurant_name}</StoreName>
                        </StoreNameGroup>
                    )}
                    {product?.avg_rating > 0 && (
                        <RatingInline>
                            <i className="fi fi-sr-star" />
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            >
                                {Number(product.avg_rating).toFixed(1)}
                            </Typography>
                        </RatingInline>
                    )}
                </StoreRow>

                <TitleText component="h5">{product?.name}</TitleText>

                <PriceRow>
                    <PriceNow>
                        {getAmount(
                            discountedPrice,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </PriceNow>
                    {hasDiscount && (
                        <PriceOld>
                            {getAmount(
                                product?.price,
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </PriceOld>
                    )}
                </PriceRow>

                {discountBadgeText && (
                    <DiscountChip>{discountBadgeText}</DiscountChip>
                )}
            </Box>
        </CardRoot>
    )
}

export default NewFoodCardVertical
