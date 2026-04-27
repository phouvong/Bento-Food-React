import React from 'react'
import { Slider, Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

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

const CustomSlider = ({ handleChangePrice, highestPrice, priceValue }) => {
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
    const [value, setValue] = React.useState(() =>
        getNormalizedRange(defaultRange, resolvedHighestPrice)
    )
    const minDistance = resolvedHighestPrice > 0 ? 1 : 0

    const handleChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) {
            return
        }

        setValue((currentValue) => {
            if (activeThumb === 0) {
                return getNormalizedRange(
                    [
                        Math.min(newValue[0], currentValue[1] - minDistance),
                        currentValue[1],
                    ],
                    resolvedHighestPrice
                )
            }

            return getNormalizedRange(
                [
                    currentValue[0],
                    Math.max(newValue[1], currentValue[0] + minDistance),
                ],
                resolvedHighestPrice
            )
        })
    }

    React.useEffect(() => {
        const nextRange =
            Array.isArray(priceValue) && priceValue.length === 2
                ? priceValue
                : [0, resolvedHighestPrice]
        setValue(getNormalizedRange(nextRange, resolvedHighestPrice))
    }, [priceValue, resolvedHighestPrice])

    const handleChangeCommitted = (event, newValue) => {
        if (typeof handleChangePrice === 'function') {
            handleChangePrice(
                getNormalizedRange(newValue, resolvedHighestPrice)
            )
        }
    }

    return (
        <Stack spacing={0.8} sx={{ mb: 1 }}>
            <Typography fontSize="13px" fontWeight={600} color="text.secondary">
                {`${value[0]} - ${value[1]}`}
            </Typography>
            <Stack spacing={2} direction="row" alignItems="center">
                <Typography>0</Typography>
                <Slider
                    onChangeCommitted={handleChangeCommitted}
                    getAriaLabel={() => 'Minimum distance'}
                    value={value}
                    onChange={handleChange}
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
                <Typography>{resolvedHighestPrice}</Typography>
            </Stack>
        </Stack>
    )
}

CustomSlider.propTypes = {}

export default CustomSlider
