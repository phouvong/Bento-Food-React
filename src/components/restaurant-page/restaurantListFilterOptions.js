import {
    RESTAURANT_FILTER_BY_OPTIONS,
    RESTAURANT_RATING_OPTIONS,
    RESTAURANT_SORT_OPTIONS,
} from '../restaurant-details/restaurantFilterOptions'

export { RESTAURANT_SORT_OPTIONS, RESTAURANT_RATING_OPTIONS }

export const RESTAURANT_LIST_TYPE_OPTIONS = [
    { value: 'veg', label: 'Veg' },
    { value: 'nonVeg', label: 'Non - Veg' },
]

export const RESTAURANT_LIST_ORDER_TYPE_OPTIONS = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'take_away', label: 'Take Away' },
    { value: 'dine_in', label: 'Dine In' },
]

export const RESTAURANT_LIST_FILTER_BY_OPTIONS =
    RESTAURANT_FILTER_BY_OPTIONS.filter(
        (opt) => opt.value !== 'currently_available'
    )

const csv = (input) => (input ? String(input).split(',').filter(Boolean) : [])

const selectedFrom = (options, activeValues) =>
    options
        .map((option) => option.value)
        .filter((value) => value && activeValues.has(value))

export const toRestaurantListPanelValue = ({
    filterByData = {},
    cuisineIds = [],
}) => {
    const value = {}
    if (filterByData.sort_by) value.sort_by = filterByData.sort_by

    const types = []
    if (filterByData.veg) types.push('veg')
    if (filterByData.non_veg) types.push('nonVeg')
    if (types.length) value.type = types.join(',')

    const orderTypes = []
    if (filterByData.delivery) orderTypes.push('delivery')
    if (filterByData.take_away) orderTypes.push('take_away')
    if (filterByData.dine_in) orderTypes.push('dine_in')
    if (orderTypes.length) value.order_type = orderTypes.join(',')

    const discover = []
    if (filterByData.free_delivery) discover.push('free_delivery')
    if (filterByData.discounted) discover.push('discounted')
    if (filterByData.popular) discover.push('popular')
    if (filterByData.new) discover.push('new_arrivals')
    if (discover.length) value.discover = discover.join(',')

    if (filterByData.rating) {
        const ratingKey = RESTAURANT_RATING_OPTIONS.find(
            (opt) => opt.value === `rating${filterByData.rating}`
        )?.value
        if (ratingKey) value.rating = ratingKey
    }

    if (cuisineIds.length) value.cuisine_ids = cuisineIds.join(',')

    return value
}

export const toRestaurantListFilterState = (panelValue = {}) => {
    const types = new Set(csv(panelValue.type))
    const orderTypes = new Set(csv(panelValue.order_type))
    const discover = new Set(csv(panelValue.discover))
    const [ratingToken] = selectedFrom(
        RESTAURANT_RATING_OPTIONS,
        new Set(csv(panelValue.rating))
    )
    const ratingValue = ratingToken
        ? Number(ratingToken.replace('rating', ''))
        : 0

    return {
        filterByData: {
            veg: types.has('veg'),
            non_veg: types.has('nonVeg'),
            delivery: orderTypes.has('delivery'),
            take_away: orderTypes.has('take_away'),
            dine_in: orderTypes.has('dine_in'),
            free_delivery: discover.has('free_delivery'),
            discounted: discover.has('discounted'),
            popular: discover.has('popular'),
            new: discover.has('new_arrivals'),
            sort_by: panelValue.sort_by || '',
            rating: ratingValue,
        },
        cuisineIds: csv(panelValue.cuisine_ids).map(Number),
        rating: ratingValue,
    }
}
