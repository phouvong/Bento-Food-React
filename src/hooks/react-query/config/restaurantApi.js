import MainApi from '../../../api/MainApi'

export const RestaurantsApi = {
    restaurants: ({
        type,
        offset,
        page_limit,
        filterType,
        searchKey,
        filterByData,
        priceAndRating,
    }) => {
        return MainApi.get(
            `/api/v1/restaurants/get-restaurants/all?filter_data=${
                filterByData?.dine_in ? 'dine_in' : ''
            }&name=${searchKey}&offset=${offset}&limit=${page_limit}&veg=${
                filterByData?.veg ? 1 : 0
            }&non_veg=${filterByData?.non_veg ? 1 : 0}&delivery=${
                filterByData?.delivery ? 1 : 0
            }&takeaway=${filterByData?.take_away ? 1 : 0}&avg_rating=${
                priceAndRating?.rating === null ? 0 : priceAndRating?.rating
            }`
        )
    },
    popularRestaurants: () => {
        return MainApi.get('/api/v1/restaurants/popular')
    },
    latestRestaurants: () => {
        return MainApi.get('/api/v1/restaurants/latest')
    },
    dine_in_restaurants: () => {
        return MainApi.get(
            `/api/v1/restaurants/dine-in?cuisine=${JSON.stringify([])}`
        )
    },
    restaurantDetails: (id) => {
        if (id) {
            return MainApi.get(`/api/v1/restaurants/details/${id}`)
        }
    },
    typeWiseRestaurantList: ({ restaurantType, type, filterData }) => {
        const cuisineId = filterData?.filterByCuisine?.map((item) => item?.id)
        return MainApi.get(
            `/api/v1/restaurants/${restaurantType}?type=${type}&discounted=${
                filterData?.filterBy?.discounted ? 1 : 0
            }&popular=${filterData?.filterBy?.popular ? 1 : 0}&veg=${
                filterData?.filterBy?.veg ? 1 : 0
            }&non_veg=${filterData?.filterBy?.non_veg ? 1 : 0} &top_rated=${
                filterData?.filterBy?.popular ? 1 : 0
            }&rating_4_plus=${
                filterData?.filterBy?.rating ? 1 : 0
            }&rating_3_plus=${filterData?.filterBy?.ratings ? 1 : 0}&rating_5=${
                filterData?.filterBy?.rating5 ? 1 : 0
            }
             &open=${filterData?.filterBy?.open ? 1 : 0}
             &cuisine=${JSON.stringify(cuisineId)}`
        )
    },
    addFavorite: (restaurant_id) => {
        return MainApi.post(
            `/api/v1/customer/wish-list/add?restaurant_id=${restaurant_id}`
        )
    },
}
