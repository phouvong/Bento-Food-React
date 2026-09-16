export const RESTAURANT_SORT_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'fast_delivery', label: 'Fast Delivery' },
    { value: 'a_to_z', label: 'A to Z' },
    { value: 'z_to_a', label: 'Z to A' },
    { value: 'price_high', label: 'Price: High to Low', priceOnly: true },
    { value: 'price_low', label: 'Price: Low to High', priceOnly: true },
]

const HALAL_OPTION = { value: 'halal', label: 'Halal' }
const VEG_OPTIONS = [
    { value: 'veg', label: 'Veg' },
    { value: 'nonVeg', label: 'Non - Veg' },
]

export const getRestaurantTypeOptions = (showVegNonVeg) =>
    showVegNonVeg ? [HALAL_OPTION, ...VEG_OPTIONS] : [HALAL_OPTION]

export const RESTAURANT_FILTER_BY_OPTIONS = [
    { value: 'free_delivery', label: 'Free Delivery' },
    { value: 'discounted', label: 'Discounted' },
    { value: 'popular', label: 'Popular' },
    { value: 'new_arrivals', label: 'New Arrivals' },
    { value: 'currently_available', label: 'Currently Available' },
]

export const RESTAURANT_DETAILS_SORT_OPTIONS = RESTAURANT_SORT_OPTIONS.filter(
    (opt) => opt.value !== 'fast_delivery'
)

export const RESTAURANT_DETAILS_FILTER_BY_OPTIONS =
    RESTAURANT_FILTER_BY_OPTIONS.filter((opt) => opt.value !== 'free_delivery')

export const RESTAURANT_RATING_OPTIONS = [
    { value: 'rating4', label: '4+ Rating' },
    { value: 'rating3', label: '3+ Rating' },
    { value: 'rating2', label: '2+ Rating' },
    { value: 'rating1', label: '1+ Rating' },
]

const ALL_TYPE_OPTIONS = [HALAL_OPTION, ...VEG_OPTIONS]

const selectedFrom = (options, activeValues) =>
    options
        .map((option) => option.value)
        .filter((value) => value && activeValues.has(value))

export const toFilterPanelValue = (checkedFilterKey = [], price = []) => {
    const active = new Set(
        checkedFilterKey
            .filter((item) => item?.isActive)
            .map((item) => item?.value)
    )

    const value = {}
    const [sortBy] = selectedFrom(RESTAURANT_SORT_OPTIONS, active)
    if (sortBy) value.sort_by = sortBy

    const types = selectedFrom(ALL_TYPE_OPTIONS, active)
    if (types.length) value.type = types.join(',')

    const filterBy = selectedFrom(RESTAURANT_FILTER_BY_OPTIONS, active)
    if (filterBy.length) value.discover = filterBy.join(',')

    const ratings = selectedFrom(RESTAURANT_RATING_OPTIONS, active)
    if (ratings.length) value.rating = ratings.join(',')

    if (Array.isArray(price) && price.length === 2) {
        value.price_min = price[0]
        value.price_max = price[1]
    }
    return value
}

const csv = (input) => (input ? String(input).split(',').filter(Boolean) : [])

export const toRestaurantFilterState = (
    panelValue = {},
    { baseFilterKeys = [], highestPrice }
) => {
    const selected = new Set(
        [
            panelValue.sort_by,
            ...csv(panelValue.type),
            ...csv(panelValue.discover),
            ...csv(panelValue.rating),
        ].filter(Boolean)
    )

    const hasMin = panelValue.price_min !== undefined && panelValue.price_min !== ''
    const hasMax = panelValue.price_max !== undefined && panelValue.price_max !== ''

    return {
        checkedFilterKey: baseFilterKeys.map((item) => ({
            ...item,
            isActive: selected.has(item?.value),
        })),
        price:
            hasMin || hasMax
                ? [
                      hasMin ? Number(panelValue.price_min) : 0,
                      hasMax ? Number(panelValue.price_max) : highestPrice,
                  ]
                : [],
    }
}
