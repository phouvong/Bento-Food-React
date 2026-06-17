import React, { useCallback, useRef, useState } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import ReorderCard from './ReorderCard'
import useGetLatestOrders, {
    LatestOrder,
} from '@/hooks/react-query/orders/useGetLatestOrders'
import useReorderFlow from '@/hooks/react-query/reorder/useReorderFlow'
import { OrderApi } from '@/hooks/react-query/config/orderApi'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'
import SliderSectionHeaderRaw from '@/components/slider-section-header/SliderSectionHeader'
import CustomModalRaw from '@/components/custom-modal/CustomModal'

const CustomModal = CustomModalRaw as unknown as React.ComponentType<
    Record<string, unknown>
>

// SliderSectionHeader's inferred prop type (from a JS file) marks every
// destructured prop as required even though defaults exist. Cast to a
// permissive component type so we can pass only what we need.
const SliderSectionHeader =
    SliderSectionHeaderRaw as unknown as React.ComponentType<
        Record<string, unknown>
    >

const GAP = 12

type GlobalSettings = {
    currency_symbol?: string
    currency_symbol_direction?: string
    digit_after_decimal_point?: number
}

// Item-level shape is loose because the slice is plain JS and items come
// from multiple APIs with overlapping fields. `unknown` is safer than
// `any` since consumers must narrow before use.
type CartItem = Record<string, unknown>
// CartGroup is partially narrowed: we read `restaurant.id` for the
// same-restaurant reorder check; everything else stays opaque.
type CartGroup = {
    restaurant?: { id?: number }
}
type CartState = {
    cartList?: CartItem[]
    cartGroups?: CartGroup[]
}
type RootState = {
    globalSettings: { global: GlobalSettings }
    cart: CartState
}

interface LastOrderSectionProps {
    // When set, the section requests the latest orders for this restaurant
    // only. Used on the restaurant details page.
    restaurantId?: number | string
    isStoreDetails?: false
}

const LastOrderSection: React.FC<LastOrderSectionProps> = ({
    restaurantId,
    isStoreDetails = false,
}) => {
    const { t } = useTranslation()
    const { cartList, cartGroups = [] } = useSelector(
        (state: RootState) => state.cart
    )
    const { global } = useSelector((state: RootState) => state.globalSettings)
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = global?.digit_after_decimal_point

    // Only fetch for logged-in users — guests have no order history.
    const token = getToken()
    const isLoggedIn = Boolean(token)

    const { data } = useGetLatestOrders({
        limit: 20,
        offset: 1,
        restaurantId,
        enabled: isLoggedIn,
    })
    const orders: LatestOrder[] = data?.orders ?? []

    console.log({cartGroups});
    

    const { triggerReorder, isWorking } = useReorderFlow()

    // The card surface only has the order summary. To run the reorder flow we
    // need the full line items, so click handlers fetch the detail first.
    // `pendingOrderId` is the per-card spinner gate.
    const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)
    const [confirmOrderId, setConfirmOrderId] = useState<number | null>(null)

    const handleReorder = useCallback(
        async (orderId: number) => {
            if (pendingOrderId != null || isWorking) return
            setPendingOrderId(orderId)
            try {
                const resp = await OrderApi.orderDetails(orderId)
                // orderDetails returns either an array (legacy) or a wrapped
                // object — handle both defensively.
                const payload = resp?.data
                console.log({ payload })
                const orderData: any[] = Array.isArray(payload)
                    ? payload
                    : payload?.details ?? payload?.data ?? []
                await triggerReorder({
                    orderData,
                    onComplete: () => setPendingOrderId(null),
                })
            } finally {
                // Release the spinner regardless of how triggerReorder
                // resolved (success, error, or short-circuit).
                setPendingOrderId((curr) => (curr === orderId ? null : curr))
            }
        },
        [pendingOrderId, isWorking, triggerReorder]
    )

    const handleReorderClick = useCallback(
        (order: LatestOrder) => {
            const orderRestaurantId = order.restaurant?.id
            const sameRestaurantInCart = cartGroups.some(
                (g) => g.restaurant?.id === orderRestaurantId
            )
            if (sameRestaurantInCart) {
                setConfirmOrderId(order.id)
                return
            }
            handleReorder(order.id)
        },
        [cartGroups, handleReorder]
    )

    const handleConfirmReorder = useCallback(() => {
        if (confirmOrderId == null) return
        const orderId = confirmOrderId
        setConfirmOrderId(null)
        handleReorder(orderId)
    }, [confirmOrderId, handleReorder])

    const handleCloseConfirm = useCallback(() => {
        setConfirmOrderId(null)
    }, [])

    // ── Slider track + arrow controls (matches NewRestaurant pattern) ──
    const trackRef = useRef<HTMLDivElement>(null)
    const scrollByAmount = useCallback((dir: number) => {
        const el = trackRef.current
        if (!el) return
        el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
    }, [])

    // SliderSectionHeader was written for react-slick — it calls
    // `sliderRef.current.slickPrev/slickNext` and reads
    // `innerSlider.props.slidesToShow` to decide whether to show arrows.
    // We mimic that shape so the same header renders our scroll arrows.
    const sliderRefShim = {
        current: {
            innerSlider: { props: { slidesToShow: 1 } },
            slickPrev: () => scrollByAmount(-1),
            slickNext: () => scrollByAmount(1),
        },
    }

    if (!isLoggedIn) return null

    if (!isLoggedIn || orders.length === 0) return null

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>
            <SliderSectionHeader
                title={t('Last Order')}
                titleComponent="h2"
                sliderRef={sliderRefShim}
                itemsCount={orders.length}
            />

            <Box
                ref={trackRef}
                sx={{

                    display: 'flex',
                    gap: `${GAP}px`,
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                   
                }}
            >
                {orders.map((order) => (
                    <Box
                        key={order.id}
                        data-card
                        sx={{
                            scrollSnapAlign: 'start',
                            flexShrink: 0,
                            flex: {
                                xs: '0 0 calc(85% - 6px)',
                                sm: '0 0 calc(50% - 6px)',
                                md: '0 0 calc(33.33% - 8px)',
                                lg: '0 0 calc(25% - 9px)',
                            },
                            minWidth: 0,
                        }}
                    >
                        <ReorderCard
                            order={order}
                            currencySymbol={currencySymbol}
                            currencySymbolDirection={currencySymbolDirection}
                            digitAfterDecimalPoint={digitAfterDecimalPoint}
                            t={t}
                            onReorder={handleReorderClick}
                            isWorking={pendingOrderId === order.id}
                            isStoreDetails={isStoreDetails}
                        />
                    </Box>
                ))}
            </Box>

            <CustomModal
                openModal={confirmOrderId != null}
                setModalOpen={handleCloseConfirm}
                maxWidth="320px"
            >
                <Stack
                    alignItems="center"
                    spacing={2}
                    sx={{ px: { xs: 2.5, sm: 3 }, pt: 3.5, pb: 3 }}
                >
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: (theme) =>
                                theme.palette.primary.main + '22',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <ShoppingCartOutlinedIcon
                            sx={{ fontSize: 30, color: 'primary.main' }}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        fontWeight={700}
                        align="center"
                        sx={{
                            lineHeight: 1.4,
                            color: 'text.primary',
                        }}
                    >
                        {t('Clear Cart & Reorder?')}
                    </Typography>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{
                            lineHeight: 1.6,
                            color: 'text.secondary',
                        }}
                    >
                        {t(
                            'Your existing cart will be cleared. Do you want to reorder?'
                        )}
                    </Typography>

                    <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ pt: 0.5, width: '100%' }}
                    >
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleCloseConfirm}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                color: 'text.primary',
                                borderColor: 'divider',
                            }}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleConfirmReorder}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {t('Yes, Reorder')}
                        </Button>
                    </Stack>
                </Stack>
            </CustomModal>
        </Box>
    )
}

export default LastOrderSection
