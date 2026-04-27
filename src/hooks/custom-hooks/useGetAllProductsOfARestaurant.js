import { ProductApis } from '../react-query/config/productsApi'
import { useQuery } from 'react-query'

export const useGetAllProductsOfARestaurant = (id, filterParams = {}) => {
    const restaurant_id = id
    const category_id = 0
    const type = 'all'
    const offset = 1
    const page_limit = 1000
    const { data } = useQuery(
        ['latest-food', restaurant_id, category_id, type, offset, page_limit, filterParams],
        () =>
            ProductApis.latestFood({
                restaurant_id,
                category_id,
                type,
                offset,
                page_limit,
                ...filterParams,
            }),
        { enabled: !!restaurant_id }
    )

    return data?.data?.products
}
