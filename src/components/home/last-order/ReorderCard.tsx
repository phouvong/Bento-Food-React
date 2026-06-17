import React from 'react'
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
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
    console.log({ order })
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
                        borderRadius: '5px',
                        p: 1.25,
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
                            textAlign: 'right',
                            fontSize: '14px',
                            color: 'text.primary',
                            letterSpacing: '-0.42px',
                            lineHeight: 1.2,
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
                        <Button
                            variant="contained"
                            disableElevation
                            disabled={isWorking}
                            onClick={() => onReorder(order)}
                            sx={{
                                flexShrink: 0,
                                backgroundColor: 'primary.main',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '14px',
                                textTransform: 'none',
                                borderRadius: '5px',
                                px: 1.25,
                                height: '30px',
                                minWidth: 0,
                                lineHeight: 1.2,
                                letterSpacing: '-0.42px',
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
                                    size={14}
                                    sx={{ color: '#fff', mx: 0.5 }}
                                />
                            ) : (
                                t('Re - Order')
                            )}
                        </Button>
                    )}
                </Stack>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: '14px',
                backgroundColor: (theme) => theme.palette.background.paper,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
            }}
        >
            {/* Top row — logo + name/date + thumbnails */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ px: 1.75, py: 1.5 }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    onClick={goToRestaurant}
                    sx={{
                        minWidth: 0,
                        flex: 1,
                        cursor: restaurant?.id ? 'pointer' : 'default',
                    }}
                >
                    <Avatar
                        src={restaurant?.logo_full_url ?? undefined}
                        alt={restaurant?.name ?? ''}
                        sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? '#374151'
                                    : '#F5F5F5',
                        }}
                    />
                    <Stack sx={{ minWidth: 0 }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                            gap={0.5}
                        >
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
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
                            }}
                        >
                            {formatDate(order.created_at)}
                        </Typography>
                    </Stack>
                </Stack>

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
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: (theme) =>
                                        `2px solid ${theme.palette.background.paper}`,
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
                                    width={32}
                                    height={32}
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
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    border: (theme) =>
                                        `2px solid ${theme.palette.background.paper}`,
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '#374151'
                                            : '#111827',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 700,
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
            </Stack>

            {/* Bottom row — price + Re-Order button */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    px: 1.75,
                    py: 1.25,
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                            ? theme.palette.background.default
                            : '#FAFAFA',
                    borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography
                    sx={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'text.primary',
                    }}
                >
                    {getAmount(
                        Number(order.order_amount) || 0,
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )}
                </Typography>

                {!order.campaign && (
                    <Button
                        variant="contained"
                        disableElevation
                        disabled={isWorking}
                        onClick={() => onReorder(order)}
                        sx={{
                            flexShrink: 0,
                            backgroundColor: 'primary.main',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '13px',
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 2.25,
                            py: 0.85,
                            minWidth: 0,
                            lineHeight: 1.2,
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
                                sx={{ color: '#fff', mx: 1 }}
                            />
                        ) : (
                            t('Re - Order')
                        )}
                    </Button>
                )}
            </Stack>
        </Box>
    )
}

export default ReorderCard
