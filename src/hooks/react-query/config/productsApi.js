import MainApi from '../../../api/MainApi'

export const MostReviewedApi = {
    reviewed: () => MainApi.get('/api/v1/products/most-reviewed'),
}
export const PopularFoodNearbyApi = {
    popularFood: () => MainApi.get('/api/v1/products/popular'),
}
export const ProductApis = {
    latestFood: ({
        restaurant_id,
        category_id,
        type,
        offset,
        page_limit,
        veg,
        non_veg,
        sort_by,
        avg_rating,
        discounted,
        open: isOpen,
        rating_3_plus,
        rating_4_plus,
        price,
    }) => {
        const params = new URLSearchParams()
        params.set('restaurant_id', restaurant_id)
        params.set('category_id', category_id ?? 0)
        params.set('type', type || 'all')
        params.set('offset', offset)
        params.set('limit', page_limit)
        if (veg) params.set('veg', 1)
        if (non_veg) params.set('non_veg', 1)
        if (sort_by) params.set('sort_by', sort_by)
        if (avg_rating) params.set('avg_rating', avg_rating)
        if (discounted) params.set('discounted', 1)
        if (isOpen) params.set('open', 1)
        if (rating_3_plus) params.set('rating_3_plus', 1)
        if (rating_4_plus) params.set('rating_4_plus', 1)
        if (Array.isArray(price) && price.length === 2) params.set('price', JSON.stringify(price))
        return MainApi.get(`/api/v1/products/latest?${params.toString()}`)
    },
    searchlatestFood: ({
        restaurant_id,
        searchKey,
        type,
        offset,
        page_limit,
    }) => {
        return MainApi.get(
            `/api/v1/products/search?restaurant_id=${restaurant_id}&name=${searchKey}&type=${type}&offset=${offset}&limit=${page_limit}`
        )
    },
}

export const ProductsApi = {
    reviewed: () => MainApi.get('/api/v1/products/most-reviewed'),
    popularFood: () => MainApi.get('/api/v1/products/popular'),
    latestFood: ({
        restaurant_id,
        category_id,
        type,
        pageOffset,
        pageLimit,
    }) => {
        return MainApi.get(
            `/api/v1/products/latest?restaurant_id=${restaurant_id}&category_id=${category_id}&type=${type}&offset=${pageOffset}&limit=${pageLimit}`
        )
    },

    products: (
        product_type,
        offset,
        page_limit,
        type,
        filterPayload = {}
    ) => {
        const { filterByData, price: priceRange, restaurant_id } = filterPayload || {}

        if (filterByData !== undefined) {
            // new format (RestaurantDetails)
            const ratingValue = Number(filterByData?.rating || 0)
            const filterByValues = Array.from(new Set([
                filterByData?.veg ? 'veg' : null,
                filterByData?.non_veg ? 'non_veg' : null,
                filterByData?.popular ? 'popular' : null,
                filterByData?.free_delivery ? 'free_delivery' : null,
                filterByData?.discounted ? 'discounted' : null,
                filterByData?.new ? 'new_arrivals' : null,
                filterByData?.halal ? 'halal' : null,
                filterByData?.currently_available ? 'currently_available' : null,
            ].filter(Boolean)))

            const params = new URLSearchParams()
            if (restaurant_id) params.set('restaurant_id', restaurant_id)
            params.set('category_id', 0)
            params.set('offset', offset)
            params.set('limit', page_limit)
            params.set('type', type || 'all')
            params.set('sort_by', filterByData?.sort_by || '')
            params.set('rating_1_plus', ratingValue === 1 ? 1 : 0)
            params.set('rating_2_plus', ratingValue === 2 ? 1 : 0)
            params.set('rating_3_plus', ratingValue === 3 ? 1 : 0)
            params.set('rating_4_plus', ratingValue === 4 ? 1 : 0)
            params.set('rating_5', ratingValue === 5 ? 1 : 0)
            params.set('price', JSON.stringify(Array.isArray(priceRange) ? priceRange : []))
            filterByValues.forEach((value) => params.append('filter_by[]', value))

            return MainApi.get(`/api/v1/products/${product_type}?${params.toString()}`)
        }

        // legacy format (other callers)
        const {
            activeFilters = [],
            filterBy = [],
            price = [],
            rating = '',
        } = filterPayload || {}

        const normalizeValue = (value = '') =>
            value.toString().replace(/[_\s-]/g, '').toLowerCase()
        const normalizedSet = new Set(activeFilters?.map((item) => normalizeValue(item)))
        const hasFilter = (...candidates) =>
            candidates.some((candidate) => normalizedSet.has(normalizeValue(candidate)))

        const vegSelected = hasFilter('veg')
        const nonVegSelected = hasFilter('nonVeg', 'non_veg', 'non veg')
        const requestType = vegSelected && !nonVegSelected ? 'veg' : nonVegSelected && !vegSelected ? 'non_veg' : type
        const sortBy = hasFilter('fast_delivery', 'fastdelivery') ? 'fast_delivery'
            : hasFilter('a_to_z', 'atoz') ? 'a_to_z'
            : hasFilter('z_to_a', 'ztoa') ? 'z_to_a'
            : hasFilter('default') ? 'default'
            : ''
        const filterByValues = Array.from(new Set((Array.isArray(filterBy) ? filterBy : []).filter(Boolean)))

        const params = new URLSearchParams()
        if (restaurant_id) params.set('restaurant_id', restaurant_id)
        if (restaurant_id) params.set('category_id', 0)
        params.set('offset', offset)
        params.set('limit', page_limit)
        params.set('type', requestType || 'all')
        params.set('sort_by', sortBy)
        params.set('veg', vegSelected ? 1 : 0)
        params.set('non_veg', nonVegSelected ? 1 : 0)
        params.set('new', hasFilter('new_arrivals', 'newarrivals', 'new') ? 1 : 0)
        params.set('popular', hasFilter('popular') ? 1 : 0)
        params.set('discounted', hasFilter('discounted', 'discount') ? 1 : 0)
        params.set('rating_3_plus', hasFilter('ratings', 'rating3', 'rating_3') ? 1 : 0)
        params.set('rating_4_plus', hasFilter('rating', 'rating4', 'rating_4') ? 1 : 0)
        params.set('rating_5', hasFilter('rating5', 'top_rated') ? 1 : 0)
        params.set('open', hasFilter('currentlyAvailable', 'currently_open', 'currentlyOpen') ? 1 : 0)
        params.set('halal', hasFilter('halal') ? 1 : 0)
        params.set('avg_rating', rating || 0)
        filterByValues.forEach((item) => params.append('filter_by[]', item))
        if (Array.isArray(price) && price?.length > 0) params.set('price', JSON.stringify(price))

        return MainApi.get(`/api/v1/products/${product_type}?${params.toString()}`)
    },
    productSearch: (
        search_type,
        value,
        offset,
        page_limit,
        filterData,
        restaurantType
    ) => {
        console.log({filterData});
        
        const cuisineId = filterData?.filterByCuisine?.map((item) => item?.id)
        const type = filterData?.filterBy?.veg
            ? 'veg'
            : filterData?.filterBy?.nonVeg
            ? 'non_veg'
            : null

        if (value !== '') {
            return MainApi.get(
                `/api/v1/${search_type}/search?name=${
                    value === undefined ? null : value
                }&offset=${offset}&limit=${search_type==="products" ? page_limit : 20}&type=${type}&new=${
                    filterData?.filterBy?.new ? 1 : 0
                }&popular=${
                    filterData?.filterBy?.popular ? 1 : 0
                }&rating_4_plus=${
                    filterData?.filterBy?.rating ? 1 : 0
                }&rating_3_plus=${
                    filterData?.filterBy?.ratings ? 1 : 0
                }&rating_5=${
                    filterData?.filterBy?.rating5 ? 1 : 0
                }&discounted=${
                    filterData?.filterBy?.discounted ? 1 : 0
                }&sort_by=${filterData?.sortBy}&dine_in=${
                    restaurantType === 'dine-in' ? 1 : 0
                }
                & cuisine=${JSON.stringify(cuisineId)}
                &open=${filterData?.filterBy?.currentlyAvailable ? 1 : 0}
                &halal=${filterData?.filterBy?.halal ? 1 : 0}
                `
            )
        }
    },

    addFavorite: (product_id) => {
        return MainApi.post(
            `/api/v1/customer/wish-list/add?food_id=${product_id}`
        )
    },
    suggestedProducts: () => MainApi.get(`/api/v1/customer/suggested-foods`),
}
