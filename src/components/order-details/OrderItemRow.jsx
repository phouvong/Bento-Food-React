import React, { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CustomImageContainer from '../CustomImageContainer'
import BogoCartItemCard from '@/components/floating-cart/restaurant-cart/BogoCartItemCard'
import { getAmount } from '@/utils/customFunctions'
import { rawFoodDataNormalize } from '@/components/new-food-card/rawFoodDataNormalize'

const mapBogoAvatarItems = (rows = []) =>
    rows.map((row) => ({
        id: row?.id ?? row?.food_id,
        image: row?.food_details?.image_full_url,
    }))

export const getAddOnsText = (addOns) => {
    const filteredAddOns = (addOns || []).filter((item) => item.quantity > 0)
    return filteredAddOns
        .map((item) => `${item.name}(${item.quantity})`)
        .join(', ')
}

// Same shape VisibleVariations reads (product.variation[].values[].label),
// flattened to plain text so it can share one line with the add-ons text.
export const getVariationText = (product) => {
    if (!(product?.variation?.length > 0)) return ''
    if (product.variation[0]?.values) {
        return product.variation
            .filter((variation) => variation?.values?.length > 0)
            .map(
                (variation) =>
                    `${variation.name} : ${variation.values
                        .map((value) => value.label)
                        .join(', ')}`
            )
            .join(' ; ')
    }
    const variationTitles =
        product?.food_details?.choice_options?.map((co) => co.title) || []
    const variationTypes = product.variation.map((v) => v.type)
    return variationTitles
        .map((title, index) => `${title} : ${variationTypes[index]}`)
        .join(' ; ')
}

// Figma node 2216:63205 (item row) / 2216:63258 (description line) —
// item image | name + price | qty badge, with a single-line variation +
// add-ons summary that only gets a collapse toggle when it actually
// overflows.
const OrderItemRow = ({
    product,
    isLast,
    currencySymbolDirection,
    currencySymbol,
    digitAfterDecimalPoint,
    t,
}) => {
    const theme = useTheme()
    const [expanded, setExpanded] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const detailsRef = useRef(null)

    const bogoDetails = product?.bogo_details

    const storeWideDiscountActive =
        Number(product?.food_details?.happy_hour_discount) > 0 ||
        Number(product?.food_details?.restaurant_discount) > 0

    const {
        price: unitPrice,
        discountedPrice: rawDiscountedUnitPrice,
        hasDiscount: rawHasDiscount,
    } = rawFoodDataNormalize(product?.food_details)

    const discountedUnitPrice = storeWideDiscountActive
        ? unitPrice
        : rawDiscountedUnitPrice
    const hasDiscount = storeWideDiscountActive ? false : rawHasDiscount

    const variationText = getVariationText(product)
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

    if (bogoDetails) {
        return (
            <Stack gap="8px" sx={{ width: '100%' }}>
                <BogoCartItemCard
                    name={bogoDetails?.offer_title}
                    price={getAmount(
                        bogoDetails?.final_price ?? bogoDetails?.bundle_price,
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )}
                    buyItems={mapBogoAvatarItems(bogoDetails?.buy_items)}
                    freeItems={mapBogoAvatarItems(bogoDetails?.free_items)}
                    quantity={bogoDetails?.quantity || product?.quantity || 1}
                    hideStepper
                />
                {!isLast && (
                    <Box
                        sx={{
                            height: '1px',
                            width: '100%',
                            backgroundColor: theme.palette.neutral[200],
                        }}
                    />
                )}
            </Stack>
        )
    }

    return (
        <Stack gap="8px" sx={{ width: '100%' }}>
            <Stack
                direction="row"
                gap="8px"
                alignItems="center"
                sx={{ width: '100%' }}
            >
                <CustomImageContainer
                    src={product?.food_details?.image_full_url}
                    height="44px"
                    width="44px"
                    loading="lazy"
                    borderRadius="8px"
                    objectFit="cover"
                />
                <Stack
                    direction="row"
                    gap="6px"
                    alignItems="flex-start"
                    sx={{ flex: 1, minWidth: 0 }}
                >
                    <Stack gap="4px" sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            noWrap
                            sx={{
                                fontSize: '14px',
                                color: theme.palette.text.primary,
                            }}
                        >
                            {product?.food_details?.name}
                        </Typography>
                        <Stack
                            direction="row"
                            alignItems="center"
                            flexWrap="wrap"
                            gap="4px"
                        >
                            {hasDiscount && (
                                <Typography
                                    sx={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: theme.palette.text.secondary,
                                        textDecoration: 'line-through',
                                    }}
                                >
                                    {getAmount(
                                        unitPrice,
                                        currencySymbolDirection,
                                        currencySymbol,
                                        digitAfterDecimalPoint
                                    )}
                                </Typography>
                            )}
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                {getAmount(
                                    discountedUnitPrice,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: theme.palette.neutral[200],
                            flexShrink: 0,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: '16px',
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            }}
                        >
                            {product?.quantity}
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>

            {detailLine && (
                <Stack direction="row" gap="8px" alignItems="flex-start">
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

            {!isLast && (
                <Box
                    sx={{
                        height: '1px',
                        width: '100%',
                        backgroundColor: theme.palette.neutral[200],
                    }}
                />
            )}
        </Stack>
    )
}

export default OrderItemRow
