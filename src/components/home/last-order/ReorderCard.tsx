import React from 'react'
import {
    Box,
    CircularProgress,
    IconButton,
    Stack,
    Typography,
} from '@mui/material'
import moment from 'moment'
import { useRouter } from 'next/router'
import { getAmount, handleRestaurantRedirect } from '@/utils/customFunctions'
import type { LatestOrder } from '@/hooks/react-query/orders/useGetLatestOrders'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'
import CustomNextImage from '@/components/CustomNextImage'

interface ReorderCardProps {
    order: LatestOrder
    currencySymbol?: string
    currencySymbolDirection?: string
    digitAfterDecimalPoint?: number
    t: (key: string) => string
    onReorder: (order: LatestOrder) => void
    isWorking?: boolean
    isStoreDetails?: boolean
}

const MAX_VISIBLE_THUMBS = 2

const formatDate = (raw?: string): string => {
    if (!raw) return ''
    const m = moment(raw)
    return m.isValid() ? m.format('DD MMM, YYYY') : ''
}

const ReorderCard: React.FC<ReorderCardProps> = ({
    order,
    currencySymbol,
    currencySymbolDirection,
    digitAfterDecimalPoint,
    t,
    onReorder,
    isWorking,
    isStoreDetails = false,
}) => {
    const router = useRouter()
    const restaurant = order.restaurant
    const images = order.item_images ?? []
    // Prefer total_item_count for the overflow badge so it reflects the real
    // line count rather than just how many image URLs the backend returned.
    const totalCount = order.total_item_count ?? images.length
    // Compute overflow against MAX_VISIBLE_THUMBS first, then absorb a
    // single-item overflow as an extra avatar slot (badges of "+1" look
    // like noise next to two thumbnails — promote that 3rd item instead).
    const baseOverflow = Math.max(totalCount - MAX_VISIBLE_THUMBS, 0)
    const visibleCount =
        baseOverflow === 1
            ? Math.min(totalCount, MAX_VISIBLE_THUMBS + 1)
            : Math.min(totalCount, MAX_VISIBLE_THUMBS)
    // Pad with `null` when image URLs are short of totalCount so every line
    // item gets a circle (Avatar falls back to its default placeholder when
    // src is null/undefined).
    const visible: (string | null)[] = Array.from(
        { length: visibleCount },
        (_, i) => images[i] ?? null
    )
    const overflow = baseOverflow === 1 ? 0 : baseOverflow
    const isVerified = restaurant?.verified ?? restaurant?.verified_seller

    const goToRestaurant = () => {
        if (!restaurant?.id) return
        handleRestaurantRedirect(router, restaurant.slug, restaurant.id)
    }

    if (isStoreDetails) {
        return (
            <Box
                sx={{
                    width: '100%',
                    borderRadius: '10px',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? theme.palette.background.default
                            : '#F0F2F7',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    overflow: 'hidden',
                    fontFamily: "'DM Sans', sans-serif",
                }}
            >
                {/* Header row: Order Id + Date */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Typography
                        sx={{
                            fontSize: '14px',
                            color: 'text.primary',
                            lineHeight: 1.2,
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {t('Order Id')}{' '}
                        <Box component="span" sx={{ fontWeight: 600 }}>
                            #{order.id}
                        </Box>
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '14px',
                            color: 'text.primary',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {formatDate(order.created_at)}
                    </Typography>
                </Stack>

                {/* Content row: thumbnails + price + button */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{
                        backgroundColor: 'background.paper',
                        borderRadius: '8px',
                        p: '12px',
                    }}
                >
                    {/* Stacked food thumbnails */}
                    {(visible.length > 0 || overflow > 0) && (
                        <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ flexShrink: 0 }}
                        >
                            {visible.map((src, i) => (
                                <Box
                                    key={`${src ?? 'placeholder'}-${i}`}
                                    sx={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: (theme) =>
                                            `1px solid ${theme.palette.background.paper}`,
                                        marginLeft: i === 0 ? 0 : '-8px',
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? '#374151'
                                                : '#F5F5F5',
                                        flexShrink: 0,
                                    }}
                                >
                                    <CustomNextImage
                                        src={src ?? undefined}
                                        alt={`item-${i + 1}`}
                                        width={30}
                                        height={30}
                                        errorWidth={20}
                                        errorHeight={20}
                                        objectFit="cover"
                                        borderRadius={undefined}
                                        aspectRatio={undefined}
                                    />
                                </Box>
                            ))}
                            {overflow > 0 && (
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: 30,
                                        height: 30,
                                        borderRadius: '50%',
                                        border: (theme) =>
                                            `1px solid ${theme.palette.background.paper}`,
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? '#374151'
                                                : '#F5F5F5',
                                        marginLeft:
                                            visible.length > 0 ? '-8px' : 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)',
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            position: 'relative',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            color: '#fff',
                                            lineHeight: 1,
                                            fontFamily: "'DM Sans', sans-serif",
                                        }}
                                    >
                                        +{overflow}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    )}

                    {/* Price */}
                    <Typography
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            textAlign: 'right',
                            fontSize: '14px',
                            color: 'text.primary',
                            letterSpacing: '-0.42px',
                            lineHeight: 1.2,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {getAmount(
                            Number(order.order_amount) || 0,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </Typography>

                    {/* Re-Order button — hidden for campaign orders since the
                        campaign may no longer be active and the reorder
                        endpoint would fail or duplicate stale items. */}
                    {!order.campaign && (
                        <IconButton
                            disabled={isWorking}
                            onClick={() => onReorder(order)}
                            aria-label={t('Re - Order')}
                            sx={{
                                flexShrink: 0,
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                backgroundColor: 'primary.main',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'primary.dark',
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: 'primary.light',
                                    color: '#fff',
                                },
                            }}
                        >
                            {isWorking ? (
                                <CircularProgress
                                    size={16}
                                    sx={{ color: '#fff' }}
                                />
                            ) : (
                                <i
                                    className="fi fi-rr-rotate-right"
                                    style={{
                                        fontSize: 18,
                                        lineHeight: 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                />
                            )}
                        </IconButton>
                    )}
                </Stack>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: '16px',
                backgroundColor: (theme) => theme.palette.background.paper,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                px: 2,
                py: 2.5,
                fontFamily: "'DM Sans', sans-serif",
            }}
        >
            {/* Top row — stacked item thumbnails + price */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%' }}
            >
                {/* Stacked item thumbnails with +N overflow */}
                {(visible.length > 0 || overflow > 0) && (
                    <Stack
                        direction="row"
                        sx={{ flexShrink: 0, alignItems: 'center' }}
                    >
                        {visible.map((src, i) => (
                            <Box
                                key={`${src ?? 'placeholder'}-${i}`}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: (theme) =>
                                        `3px solid ${theme.palette.background.paper}`,
                                    marginLeft: i === 0 ? 0 : '-10px',
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '#374151'
                                            : '#E5E7EB',
                                    flexShrink: 0,
                                }}
                            >
                                <CustomNextImage
                                    src={src ?? undefined}
                                    alt={`item-${i + 1}`}
                                    width={36}
                                    height={36}
                                    errorWidth={20}
                                    errorHeight={20}
                                    objectFit="cover"
                                    borderRadius={undefined}
                                    aspectRatio={undefined}
                                />
                            </Box>
                        ))}
                        {overflow > 0 && (
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    border: (theme) =>
                                        `3px solid ${theme.palette.background.paper}`,
                                    backgroundColor: (theme) =>
                                        theme.palette.background.paper,
                                    color: 'text.secondary',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    fontFamily: "'DM Sans', sans-serif",
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginLeft:
                                        visible.length > 0 ? '-10px' : 0,
                                }}
                            >
                                +{overflow}
                            </Box>
                        )}
                    </Stack>
                )}

                <Typography
                    sx={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'text.primary',
                        letterSpacing: '-0.6px',
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        ml: 1,
                        fontFamily: "'DM Sans', sans-serif",
                    }}
                >
                    {getAmount(
                        Number(order.order_amount) || 0,
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )}
                </Typography>
            </Stack>

            {/* Bottom row — name/date + reorder icon button */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ width: '100%' }}
            >
                <Stack
                    onClick={goToRestaurant}
                    sx={{
                        minWidth: 0,
                        flex: 1,
                        cursor: restaurant?.id ? 'pointer' : 'default',
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        sx={{ minWidth: 0 }}
                        gap={0.5}
                    >
                        <Typography
                            sx={{
                                fontSize: '16px',
                                fontWeight: 400,
                                color: 'text.primary',
                                letterSpacing: '-0.48px',
                                lineHeight: 1.1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            {restaurant?.name ?? ''}
                        </Typography>
                        <VerifiedBadge verified={isVerified} size={14} />
                    </Stack>
                    <Typography
                        sx={{
                            fontSize: '12px',
                            color: 'text.secondary',
                            lineHeight: 1.3,
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        {formatDate(order.created_at)}
                    </Typography>
                </Stack>

                {!order.campaign && (
                    <IconButton
                        disabled={isWorking}
                        onClick={() => onReorder(order)}
                        aria-label={t('Re - Order')}
                        sx={{
                            flexShrink: 0,
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            backgroundColor: 'primary.main',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: 'primary.light',
                                color: '#fff',
                            },
                        }}
                    >
                        {isWorking ? (
                            <CircularProgress size={16} sx={{ color: '#fff' }} />
                        ) : (
                            <i
                                className="fi fi-rr-rotate-right"
                                style={{
                                    fontSize: 18,
                                    lineHeight: 1,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            />
                        )}
                    </IconButton>
                )}
            </Stack>
        </Box>
    )
}

export default ReorderCard
