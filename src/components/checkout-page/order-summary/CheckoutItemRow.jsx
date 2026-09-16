import React, { useEffect, useRef, useState } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CustomImageContainer from '../../CustomImageContainer'
import BogoCartItemCard from '@/components/floating-cart/restaurant-cart/BogoCartItemCard'
import {
    getAmount,
    handleTotalAmountWithAddonsFF,
} from '@/utils/customFunctions'

const getVariationText = (item) => {
    if (!(item?.variations?.length > 0)) return ''
    return item.variations
        .map((variation) => {
            const selectedValues = (variation?.values || []).filter(
                (value) => value?.isSelected
            )
            if (!selectedValues.length) return null
            return `${variation.name} : ${selectedValues
                .map((value) => value.label)
                .join(', ')}`
        })
        .filter(Boolean)
        .join(' ; ')
}

const getAddOnsText = (selectedAddons) => {
    return (selectedAddons || [])
        .map((addon) => `${addon?.name}(${addon?.quantity})`)
        .join(', ')
}

const mapBogoAvatarItems = (rows = []) =>
    rows.map((row) => ({
        id: row?.item_id,
        image: row?.item?.image_full_url,
    }))

const CheckoutItemRow = ({
    item,
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

    if (item?.bogoDetails) {
        const details = item.bogoDetails
        return (
            <Stack gap="8px" sx={{ width: '100%' }}>
                <BogoCartItemCard
                    name={details?.offer_title}
                    price={getAmount(
                        details?.final_price ?? details?.bundle_price,
                        currencySymbolDirection,
                        currencySymbol,
                        digitAfterDecimalPoint
                    )}
                    buyItems={mapBogoAvatarItems(details?.buy_items)}
                    freeItems={mapBogoAvatarItems(details?.free_items)}
                    quantity={item?.quantity || 1}
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

    const variationText = getVariationText(item)
    const addOnsText = getAddOnsText(item?.selectedAddons)

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
        <Stack gap="8px" sx={{ width: '100%' }}>
            <Stack
                direction="row"
                gap="8px"
                alignItems="center"
                sx={{ width: '100%' }}
            >
                <CustomImageContainer
                    src={item?.image_full_url}
                    height="44px"
                    width="44px"
                    loading="lazy"
                    borderRadius="8px"
                    objectFit={item?.image_full_url ? 'cover' : 'contain'}
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
                            {item?.name}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '14px',
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                            }}
                        >
                            {getAmount(
                                handleTotalAmountWithAddonsFF(
                                    item?.itemBasePrice,
                                    item?.selectedAddons
                                ),
                                currencySymbolDirection,
                                currencySymbol,
                                digitAfterDecimalPoint
                            )}
                        </Typography>
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
                            {item?.quantity}
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

export default CheckoutItemRow
