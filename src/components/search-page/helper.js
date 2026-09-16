const parseCsv = (value) => (value ? value.split(',').filter(Boolean) : [])

// FilterPanel emits its own sort tokens; the search endpoint expects the
// legacy ones. Anything unmapped is forwarded untouched.
const SORT_BY_MAP = {
    a_z: 'a_to_z',
    z_a: 'z_to_a',
}

// Translates FilterTabs/FilterPanel output into the `filterData` shape
// ProductsApi.productSearch reads, so the new filter UI drives the same query
// params the old search filter card did.
export const toSearchFilters = (appliedFilters = {}) => {
    const types = parseCsv(appliedFilters.type)
    const discover = parseCsv(appliedFilters.discover)
    const ratings = parseCsv(appliedFilters.rating)

    const priceMax = Number(appliedFilters.price_max)
    const price = Number.isFinite(priceMax)
        ? [Number(appliedFilters.price_min) || 0, priceMax]
        : []

    return {
        sortBy: appliedFilters.sort_by
            ? SORT_BY_MAP[appliedFilters.sort_by] || appliedFilters.sort_by
            : '',
        filterBy: {
            veg: types.includes('veg'),
            nonVeg: types.includes('nonVeg'),
            halal: types.includes('halal'),
            topRated: discover.includes('topRated'),
            popular: discover.includes('popular'),
            new: discover.includes('newArrival'),
            discounted: discover.includes('discounted'),
            rating5: ratings.includes('5_plus'),
            rating: ratings.includes('4_plus'),
            ratings: ratings.includes('3_plus'),
            rating2: ratings.includes('2_plus'),
        },
        filterByCuisine: parseCsv(appliedFilters.cuisine_ids).map((id) => ({
            id: Number(id),
        })),
        categoryIds: parseCsv(appliedFilters.category_ids).map(Number),
        price,
    }
}
