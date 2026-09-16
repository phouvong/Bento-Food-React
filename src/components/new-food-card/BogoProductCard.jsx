import { useEffect, useState } from 'react'
import { Box, IconButton, Stack, Typography, alpha, styled } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import CustomImageContainer from '@/components/CustomImageContainer'
import CircularLoader from '@/components/loader/CircularLoader'
import { AddFab } from '@/components/new-food-card/NewFoodCardShared'
import useCartItemUpdate from '@/hooks/react-query/add-cart/useCartItemUpdate'
import useDeleteCartItem from '@/hooks/react-query/add-cart/useDeleteCartItem'
import { refreshCartGroups } from '@/hooks/react-query/add-cart/useGetAllCartList'
import { onErrorResponse } from '@/components/ErrorResponse'
import { getGuestId } from '@/components/checkout-page/functions/getGuestUserId'

// One product's own BOGO offer, for a store-details page — no restaurant
// info (unlike BogoStoreOfferCard). Single merged image cluster: buy items
// first, then get items, same 1/2/3-4/5+ grid + "+N" overflow rule as
// BogoStoreOfferCard, just applied to one combined list instead of two.
//   desktop: 2010:70912 (1+1), 2010:70946 (2+1), 2010:70980 (2+1 dup),
//            2010:71014 (1+1 dup), 2010:71048 (3+2)
//   mobile:  2010:71451 (2+2)
const CardRoot = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '12px',
    padding: '12px 12px 12px 16px',
    transition: 'transform .2s ease',
    '&:hover': { transform: 'translateY(-2px)' },
    [theme.breakpoints.down('sm')]: {
        alignItems: 'center',
        padding: '10px 10px 10px 12px',
    },
}))

const InfoColumn = styled(Stack)(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    gap: '6px',
    [theme.breakpoints.down('sm')]: {
        gap: '4px',
    },
}))

const BuyGetLabel = styled(Typography)(({ theme }) => ({
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '-0.42px',
    textTransform: 'uppercase',
    color: theme.palette.info.main,
    [theme.breakpoints.down('sm')]: {
        fontSize: '12px',
    },
}))

const ProductName = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.48px',
    color: theme.palette.text.primary,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        fontSize: '14px',
    },
}))

const Price = styled(Typography)(({ theme }) => ({
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.54px',
    color: theme.palette.text.primary,
}))

const ValidRow = styled(Stack)(({ theme }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: theme.palette.text.secondary,
}))

// Fluid across breakpoints — Figma only gave desktop (126px) and one mobile
// (116px) data point, no intermediate frame, so the tablet step is an
// interpolation rather than a pulled spec value.
const ClusterBox = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
    gap: '2px',
    position: 'relative',
    width: '126px',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    padding: '4px',
    borderRadius: '6px',
    backgroundColor: theme.palette.neutral[1800],
    [theme.breakpoints.down('md')]: { width: '116px' },
    [theme.breakpoints.down('sm')]: { width: '104px' },
    [theme.breakpoints.down(360)]: { width: '88px' },
}))

const ClusterCell = styled(Box)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '6px',
    backgroundColor: theme.palette.neutral[1800],
}))

const OverflowOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: theme.palette.common.white,
    fontSize: '14px',
    fontWeight: 700,
}))

// Same rule as BogoStoreOfferCard.getCellPosition — kept local since the two
// cards' clusters differ in what list they render (merged vs per-side).
const getCellPosition = (index, total) => {
    if (total === 1) return { gridColumn: '1 / span 2', gridRow: '1 / span 2' }
    if (total === 2) return { gridColumn: index + 1, gridRow: '1 / span 2' }
    return { gridColumn: (index % 2) + 1, gridRow: Math.floor(index / 2) + 1 }
}

// buyItems / getItems: [{ id | food_id, image | image_full_url, name }] —
// buy items always render before get items in the merged cluster, per the
// ordering this was asked to follow explicitly.
//
// Cart awareness mirrors NewFoodCard's non-variation add/qty control: not in
// cart → the whole card (add button included) opens the details modal via
// onCardClick/onAddClick. Already in cart → the add button becomes a qty
// badge; clicking it expands into a +/- stepper that drives the same
// bogo_group_id increment/decrement/remove calls BogoCartItemRow uses.
const BogoProductCard = ({
    buyItems = [],
    getItems = [],
    product,
    validUntil,
    onAddClick,
    onCardClick,
    offer,
    restaurantId,
}) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const { cartGroups = [] } = useSelector((state) => state.cart)
    const [incrOpen, setIncrOpen] = useState(false)
    const { mutate: updateCartMutate, isLoading: updateCartLoading } =
        useCartItemUpdate()
    const { mutate: removeCartMutate, isLoading: removeCartLoading } =
        useDeleteCartItem()

    useEffect(() => {
        if (!incrOpen) return
        const timeoutId = setTimeout(() => setIncrOpen(false), 10000)
        return () => clearTimeout(timeoutId)
    }, [incrOpen])

    if (!product || (!buyItems.length && !getItems.length)) return null

    const merged = [...buyItems, ...getItems]
    const visible = merged.slice(0, 4)
    const overflowCount = merged.length > 4 ? merged.length - 4 : 0

    // GET /customer/cart/get-all leaves a bundle as raw ungrouped rows
    // tagged with bogo_offer_id/bogo_group_id (no bundle_id) — same lookup
    // BogoItemDetailsModal's Content does, scoped to this restaurant + offer.
    const existingBundleRows = (
        cartGroups?.find(
            (group) => String(group?.restaurant?.id) === String(restaurantId)
        )?.carts || []
    ).filter(
        (cartRow) =>
            cartRow?.bogo_group_id && cartRow?.bogo_offer_id === offer?.id
    )
    const isInCart = existingBundleRows.length > 0
    const existingBogoGroupId = existingBundleRows[0]?.bogo_group_id
    const bundleQuantity = (() => {
        const row = existingBundleRows[0]
        if (!row) return 0
        const recipeItem = merged.find(
            (food) => (food?.food_id ?? food?.id) === row?.item_id
        )
        const perBundleQty = recipeItem?.quantity || 1
        return Math.max(1, Math.round((row?.quantity || 0) / perBundleQty))
    })()
    const isQtyLoading = updateCartLoading || removeCartLoading

    const refreshCart = () => {
        refreshCartGroups(dispatch)
        queryClient.refetchQueries('cart-item-restaurant')
    }

    const setQuantity = (nextQuantity) => {
        if (nextQuantity < 1) {
            removeCartMutate(
                {
                    bogo_group_id: existingBogoGroupId,
                    guestId: getGuestId(),
                    restaurant_id: restaurantId,
                },
                {
                    onSuccess: (res) => {
                        refreshCart()
                        toast.success(
                            res?.message || t('Item removed from cart')
                        )
                    },
                    onError: onErrorResponse,
                }
            )
            return
        }
        updateCartMutate(
            {
                bogo_group_id: existingBogoGroupId,
                quantity: nextQuantity,
                guest_id: getGuestId(),
            },
            { onSuccess: refreshCart, onError: onErrorResponse }
        )
    }

    return (
        <CardRoot
            onClick={onCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onCardClick?.()
            }}
        >
            <InfoColumn>
                <BuyGetLabel>
                    {t('Buy {{buy}} Get {{get}}', {
                        buy: buyItems.length,
                        get: getItems.length,
                    })}
                </BuyGetLabel>
                <ProductName>{product.name}</ProductName>
                <Price>{product.price}</Price>
                {validUntil && (
                    <ValidRow>
                        <span>{t('Valid Until')} :</span>
                        <span>{validUntil}</span>
                    </ValidRow>
                )}
            </InfoColumn>

            <ClusterBox>
                {visible.map((item, index) => {
                    const isLastVisible = index === visible.length - 1
                    return (
                        <ClusterCell
                            key={item.id ?? item.food_id ?? index}
                            sx={getCellPosition(index, visible.length)}
                        >
                            <CustomImageContainer
                                src={item.image ?? item.image_full_url}
                                alt={item.name || ''}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                            />
                            {isLastVisible && overflowCount > 0 && (
                                <OverflowOverlay>
                                    +{overflowCount}
                                </OverflowOverlay>
                            )}
                        </ClusterCell>
                    )
                })}

                {!isInCart ? (
                    <AddFab
                        onClick={(e) => {
                            e.stopPropagation()
                            onAddClick?.()
                        }}
                        aria-label="add to cart"
                        sx={{ bottom: '8px' }}
                    >
                        <i className="fi fi-br-plus" />
                    </AddFab>
                ) : !incrOpen ? (
                    <AddFab
                        onClick={(e) => {
                            e.stopPropagation()
                            setIncrOpen(true)
                        }}
                        aria-label="quantity"
                        sx={{
                            bottom: '8px',
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
                        {bundleQuantity}
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
                            bottom: '8px',
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
                        {bundleQuantity === 1 ? (
                            <IconButton
                                disabled={isQtyLoading}
                                size="small"
                                aria-label="remove"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setQuantity(0)
                                }}
                                sx={{
                                    width: 22,
                                    height: 22,
                                    padding: 0,
                                    color: (theme) => theme.palette.error.main,
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
                                disabled={isQtyLoading}
                                size="small"
                                aria-label="decrement"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setQuantity(bundleQuantity - 1)
                                }}
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

                        {isQtyLoading ? (
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
                                {bundleQuantity}
                            </Typography>
                        )}

                        <IconButton
                            disabled={isQtyLoading}
                            size="small"
                            aria-label="increment"
                            onClick={(e) => {
                                e.stopPropagation()
                                setQuantity(bundleQuantity + 1)
                            }}
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
                )}
            </ClusterBox>
        </CardRoot>
    )
}

export default BogoProductCard
