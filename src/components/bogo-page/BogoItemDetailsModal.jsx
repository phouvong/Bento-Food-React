import AddressDrawerHeader from '@/components/address-drawer/AddressDrawerHeader'
import useScrollToFitScreenDrawer from '@/hooks/custom-hooks/useScrollToFitScreenDrawer'
import useCloseOnBackButton from '@/hooks/custom-hooks/useCloseOnBackButton'
import CustomImageContainer from '@/components/CustomImageContainer'
import {
    Box,
    CircularProgress,
    Dialog,
    Drawer,
    Stack,
    useMediaQuery,
    Typography,
    useTheme,
    Button,
    alpha,
    IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useQueryClient } from 'react-query'
import { toast } from 'react-hot-toast'
import IncrementDecrementManager from '../foodDetail-modal/IncrementDecrementManager'
import { useDispatch, useSelector } from 'react-redux'
import NewFoodCard from '../new-food-card/NewFoodCard'
import useAddCartItem from '@/hooks/react-query/add-cart/useAddCartItem'
import useCartItemUpdate from '@/hooks/react-query/add-cart/useCartItemUpdate'
import useDeleteCartItem from '@/hooks/react-query/add-cart/useDeleteCartItem'
import { refreshCartGroups } from '@/hooks/react-query/add-cart/useGetAllCartList'
import { onErrorResponse } from '@/components/ErrorResponse'
import {
    getGuestId,
    getToken,
} from '@/components/checkout-page/functions/getGuestUserId'
import {
    getAmount,
    handleRestaurantRedirect,
} from '@/utils/customFunctions'
import { useRouter } from 'next/router'

const BogoItemDetailsModal = ({
    isOpenModal,
    onCloseModal,
    activeBogoItem,
    // Set by callers that already live on the offer's own store page —
    // the restaurant row stays informational instead of linking back to
    // the page the user is already on.
    disableRestaurantRedirect = false,
}) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const { handleContentScroll, sheetHeight, sheetRadius } =
        useScrollToFitScreenDrawer(Boolean(isOpenModal))
    useCloseOnBackButton(isMobile && Boolean(isOpenModal), onCloseModal)

    return (
        <>
            {' '}
            {isMobile ? (
                <Drawer
                    anchor="bottom"
                    open={Boolean(isOpenModal)}
                    onClose={() => {
                        onCloseModal()
                    }}
                    variant="temporary"
                    sx={{
                        zIndex: 1300,
                        '& .MuiDrawer-paper': {
                            width: { xs: '100vw', sm: '460px', md: '500px' },
                            maxWidth: '100vw',
                            height: { xs: sheetHeight, sm: '100%' },
                            maxHeight: { xs: sheetHeight, sm: '100%' },
                            borderTopLeftRadius: { xs: sheetRadius, sm: 0 },
                            borderTopRightRadius: { xs: sheetRadius, sm: 0 },
                            backgroundColor: (theme) =>
                                theme.palette.background.paper,
                        },
                    }}
                >
                    <Stack sx={{ height: '100%' }}>
                        <AddressDrawerHeader
                            title={t('BOGO Offer Details')}
                            onClose={() => onCloseModal()}
                        />

                        <Box
                            onScroll={handleContentScroll}
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}
                        >
                            <Content
                                activeBogoItem={activeBogoItem}
                                disableRestaurantRedirect={
                                    disableRestaurantRedirect
                                }
                            />
                        </Box>
                    </Stack>
                </Drawer>
            ) : (
                <Dialog
                    open={Boolean(isOpenModal)}
                    onClose={() => {
                        onCloseModal()
                    }}
                    PaperProps={{
                        sx: {
                            position: 'relative',
                            borderRadius: '20px',
                            width: '900px',
                            maxWidth: '92vw',
                        },
                    }}
                >
                    <IconButton
                        onClick={() => onCloseModal()}
                        aria-label="close"
                        sx={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            zIndex: 1,
                            width: 40,
                            height: 40,
                            p: '8px',
                            borderRadius: '12px',
                        }}
                    >
                        <CloseIcon
                            sx={{
                                fontSize: 20,
                                color: (theme) => theme.palette.text.primary,
                            }}
                        />
                    </IconButton>
                    <Content
                        activeBogoItem={activeBogoItem}
                        disableRestaurantRedirect={disableRestaurantRedirect}
                    />
                </Dialog>
            )}
        </>
    )
}

export const BogoItemDetailsModalStyle = styled(Box)(({ theme }) => ({
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '16px',

    // Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.neutral[400]} transparent`,

    // Chrome / Safari / Edge
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent',
        margin: '16px 0', // keeps track from touching the modal's rounded corners
        borderRadius: '16px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.neutral[400],
        borderRadius: '16px',
        border: '2px solid transparent',
        backgroundClip: 'padding-box', // shrinks visible thumb so radius reads clearly
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: theme.palette.neutral[500],
    },
}))

export const cartButtonSx = {
    borderRadius: '10px',
    height: 44,
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: '15px',
    fontWeight: 700,
    color: (theme) => theme.palette.whiteContainer.main,
    '&:hover': { boxShadow: 'none' },
}

const mapVariationsForCard = (variations = []) =>
    variations.map((variation) => ({
        name: variation?.name,
        values: (variation?.values?.label || []).map((label) => ({ label })),
    }))

const mapBundleFoodItem = (food) => ({
    id: food?.food_id,
    name: food?.name,
    image_full_url: food?.image_full_url,
    price: food?.price,
    // item-level discounts never apply inside a bundle — BOGO always uses
    // the actual price, so there is nothing to discount here.
    discount: 0,
    discount_type: 'amount',
    restaurant_discount: 0,
    veg: food?.veg,
    avg_rating: food?.avg_rating,
    rating_count: food?.rating_count,
    variations: mapVariationsForCard(food?.variations),
    add_ons: food?.add_ons,
    available_time_starts:
        food?.is_available === false ? '23:59:59' : '00:00:00',
    available_time_ends: food?.is_available === false ? '00:00:00' : '23:59:59',
})

const Content = ({ activeBogoItem, disableRestaurantRedirect }) => {
    const bundle = activeBogoItem?.bundle
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const { cartGroups = [] } = useSelector((state) => state.cart)
    const theme = useTheme()
    const { t } = useTranslation()
    const router = useRouter()
    const queryClient = useQueryClient()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const guestId = getGuestId()
    const token = getToken()

    // GET /customer/cart/get-all (what fills `cartGroups`) returns RAW,
    // ungrouped rows — unlike /cart/list it does NOT collapse a bundle into
    // one row with `bogo_details`, so each buy/free food is its own row
    // here, tagged with bogo_offer_id/bogo_group_id but no bundle_id. A
    // restaurant contributes at most one bundle per offer, so matching on
    // (restaurant_id, bogo_offer_id) is enough to find this bundle's rows.
    const existingBundleRows = (
        cartGroups?.find(
            (group) =>
                String(group?.restaurant?.id) ===
                String(activeBogoItem?.restaurant?.id)
        )?.carts || []
    ).filter(
        (cartRow) =>
            cartRow?.bogo_group_id &&
            cartRow?.bogo_offer_id === activeBogoItem?.offerId
    )
    const isInCart = existingBundleRows.length > 0
    const existingBogoGroupId = existingBundleRows[0]?.bogo_group_id

    // Every enrolled line's own `quantity` is its per-bundle recipe amount
    // times the number of bundles — divide back out using this offer's own
    // recipe (bundle.buy_items/free_items) to recover the bundle count.
    const recipeItems = [
        ...(bundle?.buy_items || []),
        ...(bundle?.free_items || []),
    ]
    const existingBundleQuantity = (() => {
        const row = existingBundleRows[0]
        if (!row) return 0
        const recipeItem = recipeItems.find(
            (food) => food?.food_id === row?.item_id
        )
        const perBundleQty = recipeItem?.quantity || 1
        return Math.max(1, Math.round((row?.quantity || 0) / perBundleQty))
    })()

    const [quantity, setQuantity] = useState(() => existingBundleQuantity || 1)
    const { mutate: addToCartMutate, isLoading: addToCartLoading } =
        useAddCartItem()
    const { mutate: updateCartMutate, isLoading: updateCartLoading } =
        useCartItemUpdate()
    const { mutate: removeCartMutate, isLoading: removeCartLoading } =
        useDeleteCartItem()
    const isCartActionLoading =
        addToCartLoading || updateCartLoading || removeCartLoading
    const unitPrice = bundle?.final_price ?? 0
    const unitOriginalPrice = bundle?.original_price ?? unitPrice
    const total = unitPrice * quantity
    const oldTotal = unitOriginalPrice * quantity

    const activeOffer = {
        image: activeBogoItem?.offerImage,
        title: activeBogoItem?.offerTitle,
        description: activeBogoItem?.offerDescription,
        buyCount: bundle?.buy_count,
        getCount: bundle?.get_count,
        validUntil: activeBogoItem?.validUntil,
        price: getAmount(
            unitPrice,
            global?.currency_symbol_direction,
            global?.currency_symbol,
            global?.digit_after_decimal_point
        ),
        restaurant: {
            id: activeBogoItem?.restaurant?.id,
            slug: activeBogoItem?.restaurant?.slug,
            name: activeBogoItem?.restaurant?.name,
            logo: activeBogoItem?.restaurant?.logoUrl,
            deliveryTime: activeBogoItem?.restaurant?.deliveryTime,
            distance_label: activeBogoItem?.restaurant?.distance_label,
        },
    }

    const goToRestaurant = disableRestaurantRedirect
        ? undefined
        : () =>
              handleRestaurantRedirect(
                  router,
                  activeOffer.restaurant.slug,
                  activeOffer.restaurant.id
              )

    // Two cart views have to resync after any bundle mutation: the grouped
    // summary in redux (`cartGroups`, drives the bubble/drawer) and the
    // per-restaurant list FloatingCart owns on /restaurants/[id] (drives
    // the store page's cart sidebar). Invalidating the restaurant key is a
    // no-op wherever that query has no observer.
    const refreshCart = () => {
        refreshCartGroups(dispatch)
        queryClient.refetchQueries('cart-item-restaurant')
    }

    // Bundle mode of POST /customer/cart/add — presence of `bogo_id`
    // (the bundle_id) selects it over the ordinary item_id/model payload.
    const handleAddToCart = () => {
        if (!bundle?.bundle_id) return

        addToCartMutate(
            {
                // Only sent for a guest — an authenticated request is
                // identified by the Bearer token MainApi already attaches.
                ...(!token && guestId ? { guest_id: guestId } : {}),
                bogo_id: bundle.bundle_id,
                quantity,
            },
            {
                onSuccess: (res) => {
                    refreshCart()
                    toast.success(res?.message || t('Item added to cart'))
                },
                onError: onErrorResponse,
            }
        )
    }

    const handleUpdateCart = () => {
        if (!existingBogoGroupId) return
        if (quantity === existingBundleQuantity) {
            toast.error(t('No changes to update'), {
                id: 'bogo-cart-no-change',
            })
            return
        }

        updateCartMutate(
            {
                bogo_group_id: existingBogoGroupId,
                quantity,
                ...(!token && guestId ? { guest_id: guestId } : {}),
            },
            {
                onSuccess: (res) => {
                    refreshCart()
                    toast.success(res?.message || t('Cart updated'))
                },
                onError: onErrorResponse,
            }
        )
    }

    const handleAddOrUpdateCart = isInCart ? handleUpdateCart : handleAddToCart

    const handleRemoveFromCart = () => {
        if (!existingBogoGroupId) return

        removeCartMutate(
            {
                bogo_group_id: existingBogoGroupId,
                guestId: !token ? guestId : undefined,
                restaurant_id: activeOffer.restaurant.id,
            },
            {
                onSuccess: (res) => {
                    refreshCart()
                    toast.success(res?.message || t('Item removed from cart'))
                    setQuantity(1)
                },
                onError: onErrorResponse,
            }
        )
    }

    const buyItems = (bundle?.buy_items || []).map(mapBundleFoodItem)
    const getItems = (bundle?.free_items || []).map(mapBundleFoodItem)

    const SectionHeader = ({ title }) => (
        <Typography
            component="h3"
            sx={{
                fontSize: '16px',
                fontWeight: 700,
                color: (theme) => theme.palette.text.primary,
                mb: '4px',
            }}
        >
            {t(title)}
        </Typography>
    )

    const OfferInfoCard = () => (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
                gap: '16px',
                width: '100%',
                px: '16px',
                py: '12px',
                borderRadius: '8px',
                backgroundColor: (theme) => theme.palette.neutral[1800],
            }}
        >
            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                <Typography
                    sx={{
                        fontSize: { xs: '16px', sm: '18px' },
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.54px',
                        color: (theme) => theme.palette.referBanner.subtitle,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {t('Buy {{buy}} Get {{get}}', {
                        buy: activeOffer.buyCount,
                        get: activeOffer.getCount,
                    })}
                </Typography>
                <Typography
                    sx={{
                        fontSize: '14px',
                        letterSpacing: '-0.42px',
                        color: (theme) => theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {t('Validity')} : {activeOffer.validUntil}
                </Typography>
            </Box>
            <Typography
                component="h3"
                sx={{
                    flexShrink: 0,
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: '-0.6px',
                    color: (theme) => theme.palette.text.primary,
                }}
            >
                {activeOffer.price}
            </Typography>
        </Stack>
    )

    const RestaurantInfoRow = () => (
        <Stack
            direction="row"
            alignItems="center"
            gap="12px"
            onClick={goToRestaurant}
            role={goToRestaurant ? 'button' : undefined}
            tabIndex={goToRestaurant ? 0 : undefined}
            onKeyDown={
                goToRestaurant
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ')
                              goToRestaurant()
                      }
                    : undefined
            }
            sx={{
                py: '12px',
                cursor: goToRestaurant ? 'pointer' : 'default',
            }}
        >
            <CustomImageContainer
                src={activeOffer.restaurant.logo}
                alt={activeOffer.restaurant.name}
                width={40}
                height={40}
                objectfit="cover"
                borderRadius="50%"
            />
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: (theme) => theme.palette.text.primary,
                    }}
                >
                    {activeOffer.restaurant.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing="4px">
                    <i
                        className="fi fi-ss-clock"
                        style={{
                            fontSize: '12px',
                            color: theme.palette.text.secondary,
                        }}
                    />
                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    >
                        {activeOffer.restaurant.deliveryTime}
                        {activeOffer.restaurant.distance_label
                            ? ` (${activeOffer.restaurant.distance_label})`
                            : ''}
                    </Typography>
                </Stack>
            </Box>
            {goToRestaurant && (
                <Box sx={{ ml: 'auto' }}>
                    <i
                        className="fi fi-sr-chevron-right"
                        style={{
                            fontSize: '14px',
                            color: theme.palette.text.secondary,
                        }}
                    />
                </Box>
            )}
        </Stack>
    )

    const LeftSideContent = () => (
        <Stack sx={{ width: '100%' }}>
            <Box
                sx={{
                    width: '100%',
                    aspectRatio: '354 / 118',
                    borderRadius: '16px 16px 0 0',
                    overflow: 'hidden',
                }}
            >
                <Box
                    component="img"
                    src={activeOffer.image}
                    alt={activeOffer.title}
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </Box>
            <Stack sx={{ gap: '24px', p: '20px' }}>
                <Stack sx={{ gap: '8px' }}>
                    <Typography
                        component="h3"
                        sx={{
                            fontSize: '24px',
                            fontWeight: 700,
                            lineHeight: 1.1,
                            letterSpacing: '-1.2px',
                            color: (theme) => theme.palette.text.primary,
                        }}
                    >
                        {activeOffer.title}
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            lineHeight: 1.3,
                            color: (theme) => theme.palette.text.secondary,
                        }}
                    >
                        {activeOffer.description}
                    </Typography>
                </Stack>
                <Stack sx={{ gap: '12px' }}>
                    <OfferInfoCard />
                    <RestaurantInfoRow />
                </Stack>
            </Stack>
        </Stack>
    )

    const FoodSections = () => (
        <Stack sx={{ gap: '20px' }}>
            {buyItems.length > 0 && (
                <Stack sx={{ gap: '12px' }}>
                    <SectionHeader title="Buy These" />
                    {buyItems.map((food) => (
                        <NewFoodCard
                            key={food?.id}
                            product={food}
                            variant="bogo"
                            productImageUrl={
                                global?.base_urls?.product_image_url
                            }
                        />
                    ))}
                </Stack>
            )}
            {getItems.length > 0 && (
                <Stack sx={{ gap: '12px' }}>
                    <SectionHeader title="You Will Get" />
                    {getItems.map((food) => (
                        <NewFoodCard
                            key={food?.id}
                            product={food}
                            variant="bogo"
                            productImageUrl={
                                global?.base_urls?.product_image_url
                            }
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    )

    return (
        <BogoItemDetailsModalStyle
            sx={
                isMobile
                    ? { maxHeight: 'none', overflowY: 'visible' }
                    : undefined
            }
        >
            {isMobile ? (
                <Stack sx={{ padding: '16px', gap: '20px' }}>
                    <Stack sx={{ gap: '12px' }}>
                        <Box
                            sx={{
                                width: '100%',
                                aspectRatio: '16 / 9',
                                borderRadius: '16px',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                component="img"
                                src={activeOffer.image}
                                alt={activeOffer.title}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </Box>
                        <Typography
                            component="h3"
                            sx={{
                                fontSize: '18px',
                                fontWeight: 700,
                                lineHeight: 1.1,
                                letterSpacing: '-0.54px',
                                textAlign: 'center',
                                color: (theme) => theme.palette.text.primary,
                                pt: '4px',
                            }}
                        >
                            {activeOffer.title}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '12px',
                                lineHeight: 1.3,
                                textAlign: 'center',
                                color: (theme) => theme.palette.text.secondary,
                            }}
                        >
                            {activeOffer.description}
                        </Typography>
                        <OfferInfoCard />
                        <RestaurantInfoRow />
                    </Stack>
                    <FoodSections />
                </Stack>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        gap: '32px',
                        padding: '32px',
                    }}
                >
                    <Stack
                        sx={{
                            gridColumn: '1 / 7',
                            borderRadius: '16px',
                            boxShadow: (theme) =>
                                `0px 1px 4px 0px ${alpha(
                                    theme.palette.common.black,
                                    0.1
                                )}, 0px 1px 4px 0px ${alpha(
                                    theme.palette.common.black,
                                    0.05
                                )}`,
                            position: 'sticky',
                            top: '32px',
                            zIndex: 10,
                            overflow: 'hidden',
                            alignSelf: 'start',
                        }}
                    >
                        <LeftSideContent />
                    </Stack>
                    <Stack sx={{ gridColumn: '7 / 13' }}>
                        <FoodSections />
                    </Stack>
                </Box>
            )}

            <Stack
                direction={isMobile ? 'column' : 'row'}
                alignItems="center"
                sx={{
                    gap: isMobile ? '8px' : '20px',
                    position: 'sticky',
                    bottom: 0,
                    width: '100%',
                    zIndex: 10,
                    py: isMobile ? '16px' : '20px',
                    backgroundColor: (theme) => theme.palette.background.paper,
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                    px: isMobile ? '16px' : '32px',
                }}
            >
                <Stack
                    direction={isMobile ? 'row' : 'column'}
                    alignItems={isMobile ? 'baseline' : 'flex-start'}
                    justifyContent={isMobile ? 'space-between' : 'flex-start'}
                    sx={{
                        gap: isMobile ? '8px' : '4px',
                        width: '100%',
                        flex: 1,
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="baseline"
                        sx={{ gap: '4px', flexWrap: 'wrap' }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                fontSize: '16px',
                                fontWeight: 500,
                                letterSpacing: '-0.48px',
                                color: (theme) => theme.palette.text.primary,
                            }}
                        >
                            {t('Total')}
                        </Typography>
                        {global?.tax_included === 1 && (
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '14px',
                                    letterSpacing: '-0.42px',
                                    color: (theme) =>
                                        theme.palette.text.secondary,
                                }}
                            >
                                ({t('Inc. VAT/TAX')})
                            </Typography>
                        )}
                    </Stack>
                    <Stack
                        direction="row"
                        alignItems="baseline"
                        sx={{ gap: '4px' }}
                    >
                        <Typography
                            component="span"
                            sx={{
                                fontSize: '20px',
                                fontWeight: 700,
                                letterSpacing: '-0.6px',
                                color: (theme) => theme.palette.text.primary,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {getAmount(
                                total,
                                global?.currency_symbol_direction,
                                global?.currency_symbol,
                                global?.digit_after_decimal_point
                            )}
                        </Typography>
                        <Typography
                            component="span"
                            sx={{
                                fontSize: '16px',
                                color: (theme) => theme.palette.text.secondary,
                                textDecoration: 'line-through',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {getAmount(
                                oldTotal,
                                global?.currency_symbol_direction,
                                global?.currency_symbol,
                                global?.digit_after_decimal_point
                            )}
                        </Typography>
                    </Stack>
                </Stack>

                <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ gap: '20px', width: '100%', flex: 1 }}
                >
                    <IncrementDecrementManager
                        decrementPrice={() =>
                            setQuantity((prev) => Math.max(1, prev - 1))
                        }
                        totalPrice={total}
                        quantity={quantity}
                        incrementPrice={() => setQuantity((prev) => prev + 1)}
                        onDelete={isInCart ? handleRemoveFromCart : undefined}
                        disabled={isCartActionLoading}
                    />
                    <Button
                        onClick={handleAddOrUpdateCart}
                        disabled={isCartActionLoading || !bundle?.bundle_id}
                        variant="contained"
                        fullWidth
                        sx={cartButtonSx}
                    >
                        {isCartActionLoading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : isInCart ? (
                            t('Update Cart')
                        ) : (
                            t('Add to cart')
                        )}
                    </Button>
                </Stack>
            </Stack>
        </BogoItemDetailsModalStyle>
    )
}

export default BogoItemDetailsModal
