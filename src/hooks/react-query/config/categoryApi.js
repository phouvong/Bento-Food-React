import MainApi from '../../../api/MainApi'

export const CategoryApi = {
    categories: (searchKey) => {

        if (searchKey && searchKey !== '') {
            return MainApi.get(`/api/v1/categories?name=${searchKey}`)
        } else {
            return MainApi.get(`/api/v1/categories`)
        }
    },
    // childCategories: (id) => MainApi.get(`categories/childes/${id}`)

    categoriesDetails: (
        category_id,
        type,
        offset,
        page_limit,
        filterByData,
        priceAndRating,
        name = ''
    ) => {
        console.log({priceAndRating});
        
        const params = new URLSearchParams()
        const filterByValues = Array.from(
            new Set(
                [
                    filterByData?.veg ? 'veg' : null,
                    filterByData?.non_veg ? 'non_veg' : null,
                    filterByData?.popular ? 'popular' : null,
                    filterByData?.free_delivery ? 'free_delivery' : null,
                    filterByData?.discounted || filterByData?.discount
                        ? 'discounted'
                        : null,
                    filterByData?.new ? 'new_arrivals' : null,
                ].filter(Boolean)
            )
        )
        const orderTypeValues = Array.from(
            new Set(
                [
                    filterByData?.take_away ? 'take_away' : null,
                    filterByData?.delivery ? 'delivery' : null,
                    filterByData?.dine_in ? 'dine_in' : null,
                ].filter(Boolean)
            )
        )
        const cuisineValues = Array.isArray(filterByData?.cuisine)
            ? filterByData.cuisine
            : []
        const ratingValue = Number(filterByData?.rating || priceAndRating?.rating || 0)

        params.set('offset', offset)
        params.set('limit', page_limit)
        params.set('name', name || '')
        params.set('type', type)
        params.set('sort_by', filterByData?.sort_by || '')
        params.set('rating_1_plus', ratingValue === 1 ? 1 : 0)
        params.set('rating_2_plus', ratingValue === 2 ? 1 : 0)
        params.set('rating_3_plus', ratingValue === 3 ? 1 : 0)
        params.set('rating_4_plus', ratingValue === 4 ? 1 : 0)
        params.set('rating_5', filterByData?.top_rated || ratingValue === 5 ? 1 : 0)
        params.set('price', JSON.stringify(priceAndRating?.price || []))
        params.set('cuisine', JSON.stringify(cuisineValues))

        filterByValues.forEach((value) => {
            params.append('filter_by[]', value)
        })
        orderTypeValues.forEach((value) => {
            params.append('order_type[]', value)
        })

        return MainApi.get(
            `/api/v1/categories/products/${category_id}?${params.toString()}`
        )
    },
    categoriesChildes: (id) => {
        return MainApi.get(`/api/v1/categories/childes/${id}`)
    },
    categoriesDetailsForRes: (
        id,
        type,
        offset,
        page_limit,
        filterByData,
        priceAndRating,
        name = ''
    ) => {
        const params = new URLSearchParams()
        const filterByValues = Array.from(
            new Set(
                [
                    filterByData?.veg ? 'veg' : null,
                    filterByData?.non_veg ? 'non_veg' : null,
                    filterByData?.popular ? 'popular' : null,
                    filterByData?.free_delivery ? 'free_delivery' : null,
                    filterByData?.discounted || filterByData?.discount
                        ? 'discounted'
                        : null,
                    filterByData?.new ? 'new_arrivals' : null,
                ].filter(Boolean)
            )
        )
        const orderTypeValues = Array.from(
            new Set(
                [
                    filterByData?.take_away ? 'take_away' : null,
                    filterByData?.delivery ? 'delivery' : null,
                    filterByData?.dine_in ? 'dine_in' : null,
                ].filter(Boolean)
            )
        )
        const cuisineValues = Array.isArray(filterByData?.cuisine)
            ? filterByData.cuisine
            : []
        const ratingValue = Number(filterByData?.rating || priceAndRating?.rating || 0)

        params.set('offset', offset)
        params.set('limit', page_limit)
        params.set('name', name || '')
        params.set('type', type)
        params.set('sort_by', filterByData?.sort_by || '')
        params.set('rating_1_plus', ratingValue === 1 ? 1 : 0)
        params.set('rating_2_plus', ratingValue === 2 ? 1 : 0)
        params.set('rating_3_plus', ratingValue === 3 ? 1 : 0)
        params.set('rating_4_plus', ratingValue === 4 ? 1 : 0)
        params.set(
            'rating_5',
            filterByData?.top_rated || ratingValue === 5 ? 1 : 0
        )
        params.set('avg_rating', ratingValue || 0)
        params.set('cuisine', JSON.stringify(cuisineValues))

        filterByValues.forEach((value) => {
            params.append('filter_by[]', value)
        })
        orderTypeValues.forEach((value) => {
            params.append('order_type[]', value)
        })

        return MainApi.get(
            `/api/v1/categories/restaurants/${id}?${params.toString()}`
        )
    },
}
