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
