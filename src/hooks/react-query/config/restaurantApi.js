import MainApi from '../../../api/MainApi'

const buildRatingQuery = (ratingValue) =>
    `&rating_1_plus=${ratingValue === 1 ? 1 : 0}&rating_2_plus=${
        ratingValue === 2 ? 1 : 0
    }&rating_3_plus=${ratingValue === 3 ? 1 : 0}&rating_4_plus=${
        ratingValue === 4 ? 1 : 0
    }&rating_5=${ratingValue === 5 ? 1 : 0}`

export const RestaurantsApi = {
    restaurants: ({
        type,
        offset,
        page_limit,
        filterType,
        searchKey,
        filterByData,
        priceAndRating,
        filterBy,
    }) => {
        const filterByItems = Array.isArray(filterBy) ? filterBy : []
        const filterByQuery = filterByItems
            .map((item) => `filter_by[]=${encodeURIComponent(item)}`)
            .join('&')
        const ratingValue = filterByData?.rating ?? priceAndRating?.rating ?? 0
        const ratingQuery = buildRatingQuery(ratingValue)
        return MainApi.get(
            `/api/v1/restaurants/get-restaurants/all?filter_data=${
                filterByData?.dine_in ? 'dine_in' : ''
            }&name=${searchKey}&offset=${offset}&limit=${page_limit}&veg=${
                filterByData?.veg ? 1 : 0
            }&non_veg=${filterByData?.non_veg ? 1 : 0}&delivery=${
                filterByData?.delivery ? 1 : 0
            }&takeaway=${
                filterByData?.take_away ? 1 : 0
            }${ratingQuery}&sort_by=${filterByData?.sort_by || ''}&cuisine=${
                filterByData?.cuisine?.length
                    ? JSON.stringify(filterByData.cuisine)
                    : 'all'
            }${filterByQuery ? `&${filterByQuery}` : ''}`
        )
    },
    popularRestaurants: () => {
        return MainApi.get('/api/v1/restaurants/popular')
    },
    featuredRestaurants: ({ limit = 10, offset = 1 } = {}) => {
        return MainApi.get('/api/v1/restaurants/featured', {
            params: { limit, offset },
        })
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
        const filterByItems = Array.isArray(filterData?.filterBy_list)
            ? filterData.filterBy_list
            : []
        const filterByQuery = filterByItems
            .map((item) => `filter_by[]=${encodeURIComponent(item)}`)
            .join('&')
        const ratingQuery = buildRatingQuery(filterData?.filterBy?.rating ?? 0)

        const categoryId = filterData?.filterByCategory?.length
            ? JSON.stringify(
                  filterData.filterByCategory.map((item) => item?.id)
              )
            : null

        if (restaurantType === 'nearby') {
            return MainApi.get(
                `/api/v1/restaurants/get-restaurants/all?filter_data=near_by_restaurants&veg=${
                    filterData?.filterBy?.veg ? 1 : 0
                }&non_veg=${
                    filterData?.filterBy?.non_veg ? 1 : 0
                }${ratingQuery}&sort_by=${
                    filterData?.filterBy?.sort_by || ''
                }&cuisine=${
                    filterData?.filterByCuisine?.length
                        ? JSON.stringify(
                              filterData.filterByCuisine.map((item) => item?.id)
                          )
                        : 'all'
                }${categoryId ? `&category_id=${categoryId}` : ''}${
                    filterByQuery ? `&${filterByQuery}` : ''
                }`
            )
        }
        const cuisineId = filterData?.filterByCuisine?.map((item) => item?.id)
        return MainApi.get(
            `/api/v1/restaurants/${restaurantType}?type=${type}&discounted=${
                filterData?.filterBy?.discounted ? 1 : 0
            }&popular=${filterData?.filterBy?.popular ? 1 : 0}&veg=${
                filterData?.filterBy?.veg ? 1 : 0
            }&non_veg=${filterData?.filterBy?.non_veg ? 1 : 0} &top_rated=${
                filterData?.filterBy?.popular ? 1 : 0
            }&free_delivery=${
                filterData?.filterBy?.freeDelivery ? 1 : 0
            }${ratingQuery}
             &open=${filterData?.filterBy?.open ? 1 : 0}
             &sort_by=${filterData?.filterBy?.sort_by || ''}
             &cuisine=${JSON.stringify(cuisineId)}${
                categoryId ? `&category_id=${categoryId}` : ''
            }${filterByQuery ? `&${filterByQuery}` : ''}`
        )
    },
    addFavorite: (restaurant_id) => {
        return MainApi.post(
            `/api/v1/customer/wish-list/add?restaurant_id=${restaurant_id}`
        )
    },
    exclusiveDeals: ({ limit = 20, offset = 1, withItems, itemLimit } = {}) => {
        const withItemsQuery = withItems
            ? `&with_items=1&item_limit=${itemLimit ?? 5}`
            : ''
        return MainApi.get(
            `/api/v1/restaurants/exclusive-deals?limit=${limit}&offset=${offset}${withItemsQuery}`
        )
    },
}
