import React, { useEffect, useMemo, useState } from 'react'
import { Box, Slider, Stack, Typography, useTheme } from '@mui/material'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'

const getNormalizedRange = (range, maxPrice) => {
    const resolvedMaxPrice = Number.isFinite(Number(maxPrice))
        ? Number(maxPrice)
        : 0

    if (!Array.isArray(range) || range.length !== 2) {
        return [0, resolvedMaxPrice]
    }

    const start = Number(range[0])
    const end = Number(range[1])

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return [0, resolvedMaxPrice]
    }

    const normalizedStart = Math.max(0, Math.min(start, resolvedMaxPrice))
    const normalizedEnd = Math.max(
        normalizedStart,
        Math.min(end, resolvedMaxPrice)
    )

    return [normalizedStart, normalizedEnd]
}

const PriceInput = ({ prefix, value, onChange, onBlur, theme }) => (
    <Stack
        direction="row"
        alignItems="center"
        sx={{
            flex: 1,
            height: '36px',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
            '&:focus-within': { borderColor: theme.palette.primary.main },
        }}
    >
        <Typography
            sx={{
                fontSize: '13px',
                color: theme.palette.text.secondary,
                whiteSpace: 'nowrap',
                lineHeight: 1,
                px: '10px',
                flexShrink: 0,
            }}
        >
            {prefix}
        </Typography>
        <Box
            component="input"
            type="number"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            sx={{
                flex: 1,
                minWidth: 0,
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontWeight: 500,
                color: theme.palette.text.primary,
                fontFamily: 'inherit',
                backgroundColor: 'transparent',
                px: '10px',
                '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                    display: 'none',
                },
            }}
        />
    </Stack>
)

const CustomSlider = ({ handleChangePrice, highestPrice, priceValue }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const { filterData } = useSelector((state) => state.searchFilterStore)
    const resolvedHighestPrice = Number.isFinite(Number(highestPrice))
        ? Number(highestPrice)
        : 0
    const defaultRange =
        Array.isArray(priceValue) && priceValue.length === 2
            ? priceValue
            : Array.isArray(filterData?.price) && filterData.price.length === 2
            ? filterData.price
            : [0, resolvedHighestPrice]
    const [value, setValue] = useState(() =>
        getNormalizedRange(defaultRange, resolvedHighestPrice)
    )
    const [minText, setMinText] = useState(String(value[0]))
    const [maxText, setMaxText] = useState(String(value[1]))
    const minDistance = resolvedHighestPrice > 0 ? 1 : 0

    const debouncedCommit = useMemo(
        () =>
            debounce((newValue, maxPrice) => {
                if (typeof handleChangePrice === 'function') {
                    handleChangePrice(getNormalizedRange(newValue, maxPrice))
                }
            }, 450),
        [handleChangePrice]
    )
    useEffect(() => () => debouncedCommit.cancel(), [debouncedCommit])

    const commit = (nextValue) => {
        setValue(nextValue)
        setMinText(String(nextValue[0]))
        setMaxText(String(nextValue[1]))
        debouncedCommit(nextValue, resolvedHighestPrice)
    }

    const handleSliderChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return
        }

        if (activeThumb === 0) {
            commit(
                getNormalizedRange(
                    [
                        Math.min(newValue[0], value[1] - minDistance),
                        value[1],
                    ],
                    resolvedHighestPrice
                )
            )
        } else {
            commit(
                getNormalizedRange(
                    [
                        value[0],
                        Math.max(newValue[1], value[0] + minDistance),
                    ],
                    resolvedHighestPrice
                )
            )
        }
    }

    const commitTextDebounced = useMemo(
        () =>
            debounce((nextValue) => {
                setValue(nextValue)
                debouncedCommit(nextValue, resolvedHighestPrice)
            }, 450),
        [debouncedCommit, resolvedHighestPrice]
    )
    useEffect(() => () => commitTextDebounced.cancel(), [commitTextDebounced])

    const handleMinInputChange = (e) => {
        const raw = e.target.value
        setMinText(raw)
        const num = Number(raw)
        if (raw === '' || Number.isNaN(num)) return
        commitTextDebounced([num, Math.max(num, value[1])])
    }

    const handleMaxInputChange = (e) => {
        const raw = e.target.value
        setMaxText(raw)
        const num = Number(raw)
        if (raw === '' || Number.isNaN(num)) return
        commitTextDebounced([Math.min(value[0], num), num])
    }

    const handleMinBlur = () => {
        commitTextDebounced.cancel()
        commit(getNormalizedRange([Number(minText) || 0, value[1]], resolvedHighestPrice))
    }

    const handleMaxBlur = () => {
        commitTextDebounced.cancel()
        commit(
            getNormalizedRange(
                [value[0], Number(maxText) || 0],
                resolvedHighestPrice
            )
        )
    }

    useEffect(() => {
        const nextRange =
            Array.isArray(priceValue) && priceValue.length === 2
                ? priceValue
                : [0, resolvedHighestPrice]
        const normalized = getNormalizedRange(nextRange, resolvedHighestPrice)
        setValue(normalized)
        setMinText(String(normalized[0]))
        setMaxText(String(normalized[1]))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priceValue, resolvedHighestPrice])

    return (
        <Stack spacing={1.2} sx={{ mb: 1 }}>
            <Stack direction="row" gap="10px" alignItems="center">
                <PriceInput
                    prefix={t('Min')}
                    value={minText}
                    onChange={handleMinInputChange}
                    onBlur={handleMinBlur}
                    theme={theme}
                />
                <Typography sx={{ color: theme.palette.text.secondary }}>
                    -
                </Typography>
                <PriceInput
                    prefix={t('Max')}
                    value={maxText}
                    onChange={handleMaxInputChange}
                    onBlur={handleMaxBlur}
                    theme={theme}
                />
            </Stack>
            <Stack spacing={2} direction="row" alignItems="center">
                <Typography fontSize="12px" color="text.secondary">
                    0
                </Typography>
                <Slider
                    getAriaLabel={() => 'Minimum distance'}
                    value={value}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(currentValue, thumbIndex) =>
                        thumbIndex === 0
                            ? `${currentValue} - ${value[1]}`
                            : `${value[0]} - ${currentValue}`
                    }
                    min={0}
                    max={resolvedHighestPrice}
                    disableSwap
                />
                <Typography fontSize="12px" color="text.secondary">
                    {resolvedHighestPrice}
                </Typography>
            </Stack>
        </Stack>
    )
}

CustomSlider.propTypes = {}

export default CustomSlider
