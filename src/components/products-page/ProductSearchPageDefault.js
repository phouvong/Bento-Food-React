import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import SearchFilterWithResults from './SearchFilterWithResults'
import { getFilterChoices } from './getFilterChoices'
import Meta from '../Meta'
import { onErrorResponse } from '../ErrorResponse'
import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import {
    setFilterbyByDispatch,
    setFoodOrRestaurant,
    setSortbyByDispatch,
} from '@/redux/slices/searchFilter'
import { setSearchTagData } from '@/redux/slices/searchTagSlice'
import { removeSpecialCharacters } from '@/utils/customFunctions'
import { searchMockData } from './SearchMockData'

const ProductSearchPage = ({
    product_type,
    configData,
    query,
    page,
    restaurantType,
    tags,
}) => {
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const router = useRouter()
    const [type, setType] = useState('all')
    const { searchTagData, selectedValue, selectedName } = useSelector(
        (state) => state.searchTags
    )
    console.log({tags,searchTagData});
    
    const [page_limit, setPageLimit] = useState(36)
    const [offset, setOffset] = useState(1)
    const [searchValue, setSearchValue] = useState('')
    const { filterData, foodOrRestaurant } = useSelector(
        (state) => state.searchFilterStore
    )
    const [checkfilter, setCheckfilter] = useState(false)
    const [pageData, setPageData] = useState({})
    const [searchOrPage, setSearchOrPage] = useState({})
    const [totalData, setTotalData] = useState(null)
    const activeFilters = searchTagData.filter((item) => item.isActive === true)
    const isPageMode = Boolean(page)
    console.log({activeFilters});
    
    // Hydrate searchTagData / filterBy / sortBy from URL query params
    useEffect(() => {
        if (!router.isReady) return

        const filtersParam = router.query.filters
        const sortByParam = router.query.sort_by

        // Skip hydration when URL has no relevant params and there are already active filters
        // This prevents resetting state during click-driven navigation flows
        const hasUrlParams =
            Boolean(filtersParam) ||
            Boolean(sortByParam) ||
            Boolean(page) ||
            Boolean(restaurantType)
        const hasActiveFiltersInState = activeFilters?.length > 0

        if (!hasUrlParams && hasActiveFiltersInState) return

        const activeValues = filtersParam
            ? String(filtersParam).split(',').filter(Boolean)
            : []

        const temPage = page === 'most-reviewed' ? 'rating' : page
        const temRestaurantType =
            restaurantType === 'latest' ? 'new_arrivals' : restaurantType

        const hydrated = searchMockData.map((item) => {
            const fromUrl = activeValues.includes(item.value)
            const fromPage =
                (temPage && item.value === temPage) ||
                (temRestaurantType && item.value === temRestaurantType)
            const fromSort = Boolean(sortByParam) && item.value === 'sort_by'
            return {
                ...item,
                isActive: Boolean(fromUrl || fromPage || fromSort),
            }
        })

        const activeFromUrl = hydrated.filter((item) => item.isActive)
        dispatch(setSearchTagData(hydrated))
        dispatch(setFilterbyByDispatch(activeFromUrl))
        dispatch(setSortbyByDispatch(sortByParam ? String(sortByParam) : ''))
    }, [
        router.isReady,
        router.query.filters,
        router.query.sort_by,
        page,
        restaurantType,
        dispatch,
    ])

    const apiKey =
        foodOrRestaurant === 'products'
            ? 'products-search'
            : 'restaurants-search'
    const handleAPiCallOnSuccess = (res) => {
        if (restaurantType && !tags) {
            dispatch(setFoodOrRestaurant('restaurants'))
            setPageData({
                ...res,
                data: {
                    ...res,
                    restaurants:
                        restaurantType === 'dine-in'
                            ? res?.data?.restaurants
                            : res?.data,
                    total_size: res?.data?.length,
                },
            })
            setSearchOrPage({
                ...res,
                data: {
                    ...res,
                    restaurants:
                        restaurantType === 'dine-in'
                            ? res?.data?.restaurants
                            : res?.data,
                    total_size: res?.data?.length,
                },
            })
        } else {
          
            setPageData(res)
            setSearchOrPage(res)
        }
        setTotalData(res?.data?.total_size)
    }

    const isDineIn = restaurantType === 'dine_in' ? restaurantType : ''
    const {  data, isError, error, refetch, isRefetching,isFetching,isLoading } = useQuery(
        [
            apiKey,
            foodOrRestaurant,
            searchValue,
            offset,
            page_limit,
            filterData?.filterByCuisine,
        ],
        () =>
            ProductsApi.productSearch(
                foodOrRestaurant,
                searchValue,
                offset,
                page_limit,
                filterData,
                restaurantType
            ),
        {
            retry: 1,
            enabled: false,
            onSuccess: handleAPiCallOnSuccess,
            onError: onErrorResponse,
        }
    )
 console.log({foodOrRestaurant});

    
    //POPULAR AND BEST REVIEW FOOD API
    // const {
    //     isLoading: popularFoodisLoading,
    //     data: popularData,
    //     refetch: popularRefetch,
    // } = useQuery(
    //     ['popular-food', offset, page_limit, type],
    //     () => ProductsApi.products(type, offset, page_limit, type),
    //     {
    //         enabled: false,
    //         onSuccess: handleAPiCallOnSuccess,
    //     }
    // )
    console.log({type});
    
    const {
        isLoading: restaurantIsLoading,
        data: restaurantData,
        refetch: restaurantRefetch,
    } = useQuery(
        [
            `restaurant-list`,
            restaurantType,
            filterData?.filterBy,
            filterData?.filterByCuisine,
        ],
        () =>
            RestaurantsApi.typeWiseRestaurantList({
                restaurantType,
                type,
                filterData,
            }),
        {
            enabled: false,
            onSuccess: handleAPiCallOnSuccess,
            onError: onErrorResponse,
        }
    )

    useEffect(() => {
        const refetchData = () => {
            if (!isPageMode && restaurantType && tags === undefined) {
                restaurantRefetch()
            }
        }

        // Add a small delay to ensure `tags` has time to set
        const delayRefetch = setTimeout(refetchData, 500) // Adjust delay as needed

        // Cleanup timeout on unmount or if dependencies change
        return () => clearTimeout(delayRefetch)
    }, [
        restaurantType,
        tags,
        offset,
        filterData?.filterBy,
        restaurantRefetch,
        filterData?.filterByCuisine,
        isPageMode,
    ])
console.log({activeFilters});

    // useEffect(() => {
    //     if (isPageMode) {
    //         popularRefetch()
    //     }
    // }, [isPageMode, offset, popularRefetch])
    useEffect(() => {
        if (restaurantType && tags) {
            setSearchValue(null)
        } else if (query) {
            setSearchValue(removeSpecialCharacters(query))
        } else if (page || restaurantType) {
            setSearchValue(null)
        } else if (tags) {
            setSearchValue(null)
        }
    }, [query, tags, restaurantType, page, offset])

    useEffect(() => {
        console.log({isPageMode,tags,page,activeFilters});
        
    const apiRefetch = async () => {
            if (searchValue) {
                await refetch()
            } else if (tags && page) {
                await refetch()
            } else if (tags) {
                if (activeFilters?.length > 0) {
                    await refetch()
                }
            }
        }
        

        apiRefetch()
    }, [searchValue, filterData, tags, offset, refetch,foodOrRestaurant])
    useEffect(() => {
        if (isPageMode) return
        setOffset(1)
        if (searchValue !== undefined) {
            refetch()
        }
    }, [foodOrRestaurant, isPageMode, refetch, searchValue])

    if (isError) {
        return <h1>{error.messages}</h1>
    }
    //const searchOrPage = All ? popularData : data
    useEffect(() => {
        handleFilteredData()
    }, [checkfilter])

    const handleFilter = () => {
        setCheckfilter((prevState) => !prevState)
    }
    const handleClearAll = async () => {
        // if (isPageMode) {
        //     await popularRefetch()
        //     return
        // }
        // await refetch()
    }
console.log({searchValue});

    const handleFilteredData = () => {
        let filteredData = getFilterChoices(
            filterData,
            searchOrPage,
            foodOrRestaurant
        )

        setPageData({
            ...searchOrPage,
            data:
                foodOrRestaurant === 'products'
                    ? {
                          ...pageData?.data,
                          products: filteredData,
                          total_size: filteredData?.length,
                      }
                    : {
                          ...pageData.data,
                          restaurants: filteredData,
                          total_size: filteredData?.length,
                      },
        })
    }

    useEffect(() => {
        setOffset(1)
    }, [searchTagData, selectedName, searchValue])
    return (
        <>
            <Meta
                title={`${searchValue ? searchValue : 'Searching...'} on ${
                    configData?.business_name
                }`}
            />
            <CustomStackFullWidth mb="5rem" sx={{ minHeight: '70vh' }}>
                <SearchFilterWithResults
                        filterData={filterData}
                        searchValue={searchValue}
                        foodOrRestaurant={foodOrRestaurant}
                        setFoodOrRestaurant={setFoodOrRestaurant}
                        isLoading={
                            
                            isRefetching || isFetching || restaurantIsLoading
                        }
                        isRefetching={isRefetching}
                        isNetworkCalling={isRefetching}
                        data={pageData}
                        page_limit={page_limit}
                        offset={offset}
                        setOffset={setOffset}
                        global={global}
                        handleFilter={handleFilter}
                        handleClearAll={handleClearAll}
                        page={page === 'most-reviewed' ? 'most_reviewed' : page}
                        // popularFoodisLoading={popularFoodisLoading}
                        restaurantType={restaurantType}
                        restaurantIsLoading={restaurantIsLoading}
                        totalData={totalData}
                    />
            </CustomStackFullWidth>
        </>
    )
}

export default ProductSearchPage
