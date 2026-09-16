const parseCsv = (value) => (value ? value.split(',').filter(Boolean) : [])

// FilterPanel emits its own sort tokens; the category endpoints expect the
// legacy ones. Anything unmapped is forwarded untouched.
const SORT_BY_MAP = {
    a_z: 'a_to_z',
    z_a: 'z_to_a',
}

const RATING_MAP = { '5_plus': 5, '4_plus': 4, '3_plus': 3, '2_plus': 2 }

// Translates FilterTabs/FilterPanel output into the `filterByData` +
// `priceAndRating` pair both CategoryApi.categoriesDetails and
// categoriesDetailsForRes read, so the new filter UI drives the exact same
// query params the old RestaurantFilterCard did.
export const toCategoryFilters = (appliedFilters = {}) => {
    const types = parseCsv(appliedFilters.type)
    const discover = parseCsv(appliedFilters.discover)
    const ratings = parseCsv(appliedFilters.rating)

    const rating = ratings.reduce(
        (highest, key) => Math.max(highest, RATING_MAP[key] || 0),
        0
    )

    const priceMax = Number(appliedFilters.price_max)
    const price = Number.isFinite(priceMax)
        ? [Number(appliedFilters.price_min) || 0, priceMax]
        : []

    return {
        filterByData: {
            veg: types.includes('veg'),
            non_veg: types.includes('nonVeg'),
            top_rated: discover.includes('topRated'),
            popular: discover.includes('popular'),
            new: discover.includes('newArrival'),
            cuisine: parseCsv(appliedFilters.cuisine_ids).map(Number),
            sort_by: appliedFilters.sort_by
                ? SORT_BY_MAP[appliedFilters.sort_by] || appliedFilters.sort_by
                : '',
            rating,
        },
        priceAndRating: { price, rating },
    }
}

export const handleFilterData = (
    checkedFilterKey,
    setFilterByData,
    setOffSet,
    setForFilter
) => {
    const activeFilters = checkedFilterKey.filter(
        (filter) => filter.isActive === true
    )
    const normalizeValue = (value = '') =>
        value.toString().replace(/[_\s-]/g, '').toLowerCase()
    const hasActiveFilter = (...candidates) =>
        activeFilters.some((filter) =>
            candidates.includes(normalizeValue(filter?.value))
        )
    const sortByMap = {
        default: 'default',
        fastdelivery: 'fast_delivery',
        atoz: 'a_to_z',
        ztoa: 'z_to_a',
    }
    const selectedSort = activeFilters.find((filter) =>
        Object.keys(sortByMap).includes(normalizeValue(filter?.value))
    )
    const cuisineValues = Array.from(
        new Set(
            activeFilters
                .map((filter) => filter?.value)
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        /^\d+$/.test(value.toString())
                )
                .map((value) => Number(value))
        )
    )

    const newFilteredData = {
        veg: hasActiveFilter('veg'),
        non_veg: hasActiveFilter('nonveg'),
        top_rated: hasActiveFilter('toprated'),
        popular: hasActiveFilter('popular'),
        discount: hasActiveFilter('discount', 'discounted'),
        discounted: hasActiveFilter('discount', 'discounted'),
        free_delivery: hasActiveFilter('freedelivery'),
        new: hasActiveFilter('latest', 'new', 'newarrivals'),
        take_away: hasActiveFilter('takeaway'),
        delivery: hasActiveFilter('delivery'),
        dine_in: hasActiveFilter('dinein'),
        cuisine: cuisineValues,
        sort_by: selectedSort
            ? sortByMap[normalizeValue(selectedSort?.value)]
            : '',
        rating: hasActiveFilter('rating4') ? 4 : hasActiveFilter('rating3') ? 3 : hasActiveFilter('rating2') ? 2 : hasActiveFilter('rating1') ? 1 : 0,
    }
    setFilterByData(newFilteredData)
    //handleDropClose()
    setOffSet(1)
    setForFilter(true)
    //window.scrollTo(0, responsiveTop)
}
