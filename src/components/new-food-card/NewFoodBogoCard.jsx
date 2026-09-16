import {
    Box,
    IconButton,
    Stack,
    Typography,
    alpha,
    styled,
    useTheme,
    Tooltip,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import {
    ProductHalalSvg,
    ProductVegSvg,
    ProductNonVegSvg,
} from '@/components/new-food-card/ProductBadgeIcons'
import CustomImageContainer from '@/components/CustomImageContainer'
import {
    MediaInner,
    ImgGradientOverlay,
    PriceNow,
    PriceOld,
    PriceRow,
    RatingInline,
    StoreRow,
    TitleText,
    UnavailableOverlay,
    UnavailableText,
    BadgeRow,
    TypeBadge,
} from '@/components/new-food-card/NewFoodCardShared'
import { getAmount } from '@/utils/customFunctions'
import { getAddOnsText, getVariationText } from '../order-details/OrderItemRow'
import { useEffect, useRef, useState } from 'react'

const BogoCardRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch',
    gap: 8,
    width: '100%',
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: `0px 1px 4px 0px ${alpha(theme.palette.common.black, 0.05)}`,
    paddingLeft: 16,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    '&:hover .img-gradient-overlay': { opacity: 1 },
}))

const HorizontalMedia = styled(Box)(({ theme }) => ({
    position: 'relative',
    flexShrink: 0,
    width: 96,
    height: 96,
    [theme.breakpoints.up('sm')]: {
        width: 115,
        height: 115,
    },
    borderRadius: 8,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.neutral[200],
    '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
}))

const HorizontalTitleText = styled(TitleText)(() => ({
    fontSize: 14,
    letterSpacing: '-0.42px',
    WebkitLineClamp: 2,
}))

const NewFoodBogoCard = ({
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
    const [expanded, setExpanded] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const detailsRef = useRef(null)

    const variationText = getVariationText({
        ...product,
        variation: product?.variations,
    })
    const addOnsText = getAddOnsText(product?.add_ons)

    const detailParts = []
    if (variationText) detailParts.push(`${t('Variation')} : ${variationText}`)
    if (addOnsText) detailParts.push(`${t('Addons')} : ${addOnsText}`)
    const detailLine = detailParts.join(' . ')

    useEffect(() => {
        if (!detailsRef.current) return
        setIsOverflowing(
            detailsRef.current.scrollWidth > detailsRef.current.clientWidth
        )
    }, [detailLine])

    return (
        <BogoCardRoot onClick={() => {}}>
            <Box sx={{ flex: 1, minWidth: 0, py: '2px' }}>
                {product?.avg_rating > 0 ? (
                    <StoreRow sx={{ marginBottom: '4px' }}>
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
                    </StoreRow>
                ) : null}

                <HorizontalTitleText component="h5">
                    {product?.name}
                </HorizontalTitleText>

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

                {detailLine && (
                    <Stack
                        direction="row"
                        gap="8px"
                        alignItems="flex-start"
                        sx={{ width: '100%', maxWidth: '250px' }}
                    >
                        <Typography
                            ref={detailsRef}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: '13px',
                                color: theme.palette.text.secondary,
                                whiteSpace: expanded ? 'normal' : 'nowrap',
                                overflow: 'hidden',
                                textOverflow: expanded ? 'clip' : 'ellipsis',
                                wordBreak: expanded ? 'break-word' : 'normal',
                                transition: 'white-space 0.15s ease',
                            }}
                        >
                            {detailLine}
                        </Typography>
                        {isOverflowing && (
                            <IconButton
                                size="small"
                                onClick={() => setExpanded((prev) => !prev)}
                                sx={{ padding: '2px', flexShrink: 0 }}
                            >
                                <KeyboardArrowDownIcon
                                    sx={{
                                        fontSize: '18px',
                                        color: theme.palette.text.secondary,
                                        transform: expanded
                                            ? 'rotate(180deg)'
                                            : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease',
                                    }}
                                />
                            </IconButton>
                        )}
                    </Stack>
                )}
            </Box>

            <HorizontalMedia className="new-food-media">
                <MediaInner sx={{ borderRadius: 0 }}>
                    <CustomImageContainer
                        src={imageUrl}
                        alt={product?.name}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        borderRadius="0px"
                        errorWidth={60}
                        errorHeight={60}
                    />
                    <ImgGradientOverlay className="img-gradient-overlay" />
                    {!available && (
                        <UnavailableOverlay sx={{ borderRadius: 0 }}>
                            <UnavailableText>
                                {t('Not Available Now')}
                            </UnavailableText>
                        </UnavailableOverlay>
                    )}
                </MediaInner>
                {(showVegBadge || showHalalBadge) && (
                    <BadgeRow sx={{ top: 7, left: 7 }}>
                        {showVegBadge && (
                            <Tooltip
                                title={
                                    product?.veg === 1
                                        ? t('This is a veg food')
                                        : t('This is a non veg food')
                                }
                                arrow
                            >
                                <TypeBadge
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: (theme) =>
                                            theme.palette.neutral[200],
                                    }}
                                >
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
                                <TypeBadge
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: (theme) =>
                                            theme.palette.neutral[200],
                                    }}
                                >
                                    <ProductHalalSvg />
                                </TypeBadge>
                            </Tooltip>
                        )}
                    </BadgeRow>
                )}
            </HorizontalMedia>
        </BogoCardRoot>
    )
}

export default NewFoodBogoCard
