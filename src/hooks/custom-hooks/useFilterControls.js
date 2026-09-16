import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

const parseCsv = (v) => (v ? v.split(',').filter(Boolean) : [])
const toCsv = (arr) => (arr.length ? arr.join(',') : undefined)

export const FILTER_QUERY_KEYS = [
    'type',
    'discover',
    'rating',
    'category_ids',
    'cuisine_ids',
    'price_min',
    'price_max',
    'sort_by',
]

const useFilterControls = ({ redirectFilterTo } = {}) => {
    const router = useRouter()
    const [appliedFilters, setAppliedFilters] = useState({})
    const [anchorEl, setAnchorEl] = useState(null)

    useEffect(() => {
        if (redirectFilterTo || !router.isReady) return
        const fromQuery = FILTER_QUERY_KEYS.reduce((acc, key) => {
            if (router.query[key] !== undefined) acc[key] = router.query[key]
            return acc
        }, {})
        if (Object.keys(fromQuery).length) {
            setAppliedFilters(fromQuery)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady])

    const navigateWithFilters = (filters) => {
        if (!redirectFilterTo) return
        router.push({ pathname: redirectFilterTo, query: filters })
    }

    const applyFilters = (filters) => {
        setAppliedFilters(filters)
        navigateWithFilters(filters)
    }

    const toggleDimension = (dimension, value, exclusiveWith) => {
        setAppliedFilters((prev) => {
            const current = parseCsv(prev[dimension])
            let next
            if (current.includes(value)) {
                next = current.filter((v) => v !== value)
            } else {
                const withoutExclusive = exclusiveWith
                    ? current.filter((v) => !exclusiveWith.includes(v))
                    : current
                next = [...withoutExclusive, value]
            }
            const csv = toCsv(next)
            const updated = { ...prev }
            if (csv) updated[dimension] = csv
            else delete updated[dimension]
            navigateWithFilters(updated)
            return updated
        })
    }

    // price_min/price_max are one "Price Range" dimension in the panel
    // (see FilterPanel's countSelected) — count them as one here too, or
    // the pill shows a higher number than the panel's own Apply button.
    const hasPriceRange =
        appliedFilters.price_min !== undefined ||
        appliedFilters.price_max !== undefined
    const otherKeysCount = Object.keys(appliedFilters).filter(
        (key) => key !== 'price_min' && key !== 'price_max'
    ).length
    const filterCount = otherKeysCount + (hasPriceRange ? 1 : 0)
    const filterActive = filterCount > 0

    // /home/filter only exists to show results for a filter handed off from
    // /home — once the user clears every filter there, there's nothing left to
    // show and we send them back.
    const hadFiltersRef = useRef(filterActive)
    useEffect(() => {
        if (filterActive) {
            hadFiltersRef.current = true
        } else if (
            hadFiltersRef.current &&
            router.pathname === '/home/filter'
        ) {
            router.push('/home')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterActive])

    const resetFilters = (e) => {
        e?.stopPropagation?.()
        setAppliedFilters({})
    }

    const clearPriceRange = () => {
        setAppliedFilters((prev) => {
            const isPriceSort =
                prev.sort_by === 'price_high' || prev.sort_by === 'price_low'
            if (
                prev.price_min === undefined &&
                prev.price_max === undefined &&
                !isPriceSort
            )
                return prev
            const { price_min, price_max, ...rest } = prev
            if (isPriceSort) delete rest.sort_by
            navigateWithFilters(rest)
            return rest
        })
    }

    const openPanel = (e) => setAnchorEl(e.currentTarget)
    const closePanel = () => setAnchorEl(null)

    return {
        appliedFilters,
        filterCount,
        filterActive,
        toggleDimension,
        applyFilters,
        resetFilters,
        clearPriceRange,
        anchorEl,
        openPanel,
        closePanel,
    }
}

export default useFilterControls
