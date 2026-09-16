import React, { useState } from 'react'
import { alpha, Box, Collapse, IconButton, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { InstructionWrapper, TitleTypography } from './OrderDetail.style'
import { getToken } from '../checkout-page/functions/getGuestUserId'
import VerifiedBadge from '@/components/verified-badge/VerifiedBadge'

const INACTIVE_STATUSES = ['delivered', 'failed', 'canceled', 'refunded']

const FlatIcon = ({ className, fontSize = '16px', color }) => (
    <Box component="i" className={className} sx={{ fontSize, color }} />
)

const PinIconBadge = ({ icon }) => {
    const theme = useTheme()
    return (
        <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: theme.palette.neutral[200],
                flexShrink: 0,
            }}
        >
            {icon}
        </Stack>
    )
}

// Restaurant + recipient summary shown above the order items list.
// Figma: node 2216:63167 (expanded) / 376:62906 (collapsed)
const DeliveryInfoCard = ({ order, onRestaurantLocationClick }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const [expanded, setExpanded] = useState(true)

    const restaurant = order?.restaurant
    const deliveryAddressInfo = order?.delivery_address
    const deliveryInstruction = order?.delivery_instruction
    const unavailableItemNote = order?.unavailable_item_note
    const hasNotes = Boolean(deliveryInstruction || unavailableItemNote)

    const canChatWithRestaurant =
        !INACTIVE_STATUSES.includes(order?.order_status) && Boolean(getToken())

    const handleRestaurantChat = canChatWithRestaurant
        ? () =>
            router.push({
                pathname: '/info',
                query: {
                    page: 'inbox',
                    type: 'vendor',
                    id: restaurant?.vendor_id,
                    routeName: 'vendor_id',
                    chatFrom: 'true',
                    restaurantName: restaurant?.name,
                    logo: restaurant?.logo,
                },
            })
        : undefined

    const handleRestaurantClick = () => {
        if (!restaurant?.slug && !restaurant?.id) return
        router.push(`/restaurants/${restaurant.slug || restaurant.id}`)
    }

    return (
        <Stack
            gap="16px"
            sx={{
                width: '100%',
                padding: { xs: '14px 12px', md: '20px 12px' },
                backgroundColor: theme.palette.neutral[1800],
                borderRadius: '10px',
            }}
        >
            <Stack gap="0px" sx={{ width: '100%' }}>
                <Stack direction="row" gap="12px" sx={{ width: '100%' }}>
                    <Stack alignItems="center" sx={{ flexShrink: 0 }}>
                        <PinIconBadge
                            icon={
                                <FlatIcon
                                    className="fi fi-rs-marker"
                                    fontSize="14px"
                                    color={theme.palette.text.primary}
                                />
                            }
                        />
                        <Box
                            sx={{
                                width: '1px',
                                flexGrow: 1,
                                minHeight: '20px',
                                borderLeft: `2px dotted ${theme.palette.neutral[400]}`,
                            }}
                        />
                    </Stack>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap="8px"
                        sx={{ flex: 1, minWidth: 0, pb: '16px' }}
                    >
                        <Stack gap="2px" sx={{ minWidth: 0 }}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap="4px"
                                onClick={handleRestaurantClick}
                                sx={{
                                    cursor: 'pointer',
                                    minWidth: 0,
                                }}
                            >
                                <Typography
                                    noWrap
                                    sx={{
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    {restaurant?.name}
                                </Typography>
                                <VerifiedBadge
                                    verified={restaurant?.verified_seller}
                                    size={14}
                                />
                            </Stack>
                            <Typography
                                onClick={onRestaurantLocationClick}
                                sx={{
                                    fontSize: '13px',
                                    color: theme.palette.text.secondary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: 'vertical',
                                    cursor: onRestaurantLocationClick
                                        ? 'pointer'
                                        : 'default',
                                }}
                            >
                                {restaurant?.address}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap="4px"
                            sx={{ flexShrink: 0 }}
                        >
                            {restaurant?.phone && (
                                <IconButton
                                    component="a"
                                    href={`tel:${restaurant.phone}`}
                                    size="small"
                                    sx={{ borderRadius: '8px', padding: '8px' }}
                                >
                                    <FlatIcon
                                        className="fi fi-rr-phone-call"
                                        fontSize="18px"
                                        color={theme.palette.text.primary}
                                    />
                                </IconButton>
                            )}
                            {handleRestaurantChat && (
                                <IconButton
                                    size="small"
                                    onClick={handleRestaurantChat}
                                    sx={{ borderRadius: '8px', padding: '8px' }}
                                >
                                    <FlatIcon
                                        className="fi fi-rr-messages"
                                        fontSize="18px"
                                        color={theme.palette.text.primary}
                                    />
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>
                </Stack>

                <Stack direction="row" gap="12px" sx={{ width: '100%' }}>
                    <Stack alignItems="center" sx={{ flexShrink: 0 }}>
                        <PinIconBadge
                            icon={
                                <FlatIcon
                                    className="fi fi-rs-location-arrow"
                                    fontSize="14px"
                                    color={theme.palette.text.disabled}
                                />
                            }
                        />
                    </Stack>
                    <Stack sx={{ flex: 1, minWidth: 0 }} gap="2px">
                        {(deliveryAddressInfo?.contact_person_name ||
                            deliveryAddressInfo?.contact_person_number) && (
                            <Stack
                                direction="row"
                                alignItems="baseline"
                                gap="6px"
                                flexWrap="wrap"
                            >
                                {deliveryAddressInfo?.contact_person_name && (
                                    <Typography
                                        noWrap
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: 700,
                                            color: theme.palette.text.primary,
                                        }}
                                    >
                                        {deliveryAddressInfo.contact_person_name}
                                    </Typography>
                                )}
                                {deliveryAddressInfo?.contact_person_number && (
                                    <Typography
                                        component="a"
                                        href={`tel:${deliveryAddressInfo.contact_person_number}`}
                                        sx={{
                                            fontSize: '13px',
                                            color: theme.palette.text
                                                .secondary,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {deliveryAddressInfo.contact_person_number}
                                    </Typography>
                                )}
                            </Stack>
                        )}
                        <Typography
                            sx={{
                                fontSize: '13px',
                                color: theme.palette.text.secondary,
                            }}
                        >
                            {deliveryAddressInfo?.address}
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>

            {hasNotes && (
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <InstructionWrapper
                        gap="12px"
                        sx={{
                            backgroundColor: alpha(
                                theme.palette.info.main,
                                theme.palette.mode === 'dark' ? 0.12 : 0.08
                            ),
                        }}
                    >
                        {deliveryInstruction && (
                            <Stack gap="2px">
                                <TitleTypography sx={{ fontSize: '14px' }}>
                                    {t('Instructions')}
                                </TitleTypography>
                                <Typography
                                    sx={{
                                        fontSize: '13px',
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    {t(deliveryInstruction)}
                                </Typography>
                            </Stack>
                        )}
                        {deliveryInstruction && unavailableItemNote && (
                            <Box
                                sx={{
                                    height: '1px',
                                    width: '100%',
                                    backgroundColor: theme.palette.divider,
                                }}
                            />
                        )}
                        {unavailableItemNote && (
                            <Stack gap="2px">
                                <TitleTypography sx={{ fontSize: '14px' }}>
                                    {t('Unavailable item note')}
                                </TitleTypography>
                                <Typography
                                    sx={{
                                        fontSize: '13px',
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    {t(unavailableItemNote)}
                                </Typography>
                            </Stack>
                        )}
                    </InstructionWrapper>
                </Collapse>
            )}

            {hasNotes && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    gap="4px"
                    onClick={() => setExpanded((prev) => !prev)}
                    sx={{ cursor: 'pointer' }}
                >
                    <Typography
                        sx={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: theme.palette.primary.main,
                        }}
                    >
                        {expanded ? t('See Less') : t('See More')}
                    </Typography>
                    <IconButton size="small" sx={{ padding: 0 }}>
                        <KeyboardArrowDownIcon
                            sx={{
                                fontSize: '20px',
                                color: theme.palette.primary.main,
                                transform: expanded
                                    ? 'rotate(180deg)'
                                    : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                            }}
                        />
                    </IconButton>
                </Stack>
            )}
        </Stack>
    )
}

export default DeliveryInfoCard
