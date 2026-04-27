import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box, Stack } from '@mui/material'
import TopBanner from './HeadingBannerSection/TopBanner'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CustomContainer from '../container'
import RestaurantCategoryBar from './RestaurantCategoryBar'
import { useGetAllCategories } from '@/hooks/custom-hooks/useGetAllCategories'
import { useQuery } from 'react-query'
import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import CategoriesWiseFood from './CategoriesWiseFood'
import { restaurantDiscountTag } from '@/utils/customFunctions'
import RestaurentDetailsShimmer from './RestaurantShimmer/RestaurentDetailsShimmer'
import { useGetRecommendProducts } from '@/hooks/react-query/config/useGetRecommendProduct'
import { debounce } from 'lodash'
import CustomSearch from '../custom-search/CustomSearch'
import { t } from 'i18next'
import { useRestaurentFoodSearch } from '@/hooks/custom-hooks/useRestaurentFoodSearch'
import { usePopularFoods } from '@/hooks/react-query/restaurants/usePopularFoods'
import { useInView } from 'react-intersection-observer'
import FloatingDiscountTag from '@/components/restaurant-details/FloatingDiscountTag'
import useHideOnScroll from '@/hooks/custom-hooks/useHideOnScroll'

const getCombinedCategoriesAndProducts = (
    all_categories,
    all_products,
    restaurantCategoryIds,
    recommendProducts
    // popularProducts
) => {
    const allCategories = all_categories
    const allProducts = all_products

    const recommend = {
        id: 1233,
        name: t('Recommend Products'),
        products: recommendProducts?.products,
        isBgColor: true,
    }

    if (allCategories?.length > 0 && allProducts?.length > 0) {
        const seenIds = new Set()
        const uniqueProducts = allProducts.filter((product) => {
            if (!product?.id || seenIds.has(product.id)) return false
            seenIds.add(product.id)
            return true
        })
        const data = allCategories?.map((item) => {
            const categoryItems = uniqueProducts?.filter(
                (product) => product?.category_ids?.some(
                    (cat) => Number(cat?.id) === Number(item?.id)
                )
            )
            if (categoryItems.length > 0) {
                return {
                    ...item,
                    products: categoryItems,
                }
            } else {
                return {
                    products: [],
                }
            }
        })
        if (recommendProducts?.products?.length > 0) {
            return [recommend, ...data]
        } else if (recommendProducts?.products?.length > 0) {
            return [recommend, ...data]
        } else {
            return data
        }
    } else {
        return []
    }
}

const restaurantFoodMockData = [
    { id: 0, name: 'Veg', value: 'veg', isActive: false },
    { id: 1, name: 'Non Veg', value: 'nonVeg', isActive: false },
    { id: 2, name: 'Default', value: 'default', isActive: false },
    { id: 3, name: 'Fast Delivery', value: 'fast_delivery', isActive: false },
    { id: 4, name: 'A to Z', value: 'a_to_z', isActive: false },
    { id: 5, name: 'Z to A', value: 'z_to_a', isActive: false },
    { id: 10, name: 'Rating 4+', value: 'rating4', isActive: false },
    { id: 11, name: 'Rating 3+', value: 'rating3', isActive: false },
    { id: 12, name: 'Rating 2+', value: 'rating2', isActive: false },
    { id: 13, name: 'Rating 1+', value: 'rating1', isActive: false },
    { id: 14, name: 'Discounted', value: 'discounted', isActive: false },
    { id: 15, name: 'New Arrivals', value: 'new_arrivals', isActive: false },
    { id: 16, name: 'Currently Available', value: 'currently_available', isActive: false },
    { id: 17, name: 'Halal', value: 'halal', isActive: false },
]

const RestaurantDetails = ({ restaurantData }) => {
    const [data, setData] = useState([])
    const [allFoods, setAllFoods] = useState([])
    const [page_limit, setPageLimit] = useState(50)
    const [offset, SetOffSet] = useState(1)
    const [selectedId, setSelectedId] = useState(null)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [showComponent, setShowComponent] = useState(true)
    const [checkedFilterKey, setCheckedFilterKey] = useState(restaurantFoodMockData)

    const [priceAndRating, setPriceAndRating] = useState({ price: [], rating: 0 })
    const [searchKey, setSearchKey] = useState('')
    const restaurantId = restaurantData?.id
    const activeFilters = checkedFilterKey?.filter((item) => item?.isActive)

    const has = (val) => checkedFilterKey.some(item => item.isActive && item.value === val)
    const filterByData = {
        veg: has('veg'),
        non_veg: has('nonVeg'),
        popular: has('popular'),
        free_delivery: has('free_delivery'),
        discounted: has('discounted'),
        new: has('new_arrivals'),
        halal: has('halal'),
        currently_available: has('currently_available'),
        sort_by: has('fast_delivery') ? 'fast_delivery' : has('a_to_z') ? 'a_to_z' : has('z_to_a') ? 'z_to_a' : '',
        rating: has('rating4') ? 4 : has('rating3') ? 3 : has('rating2') ? 2 : has('rating1') ? 1 : (priceAndRating?.rating || 0),
    }
    console.log({checkedFilterKey,filterByData});
    

    const { data: productsQueryData, isFetching: isQueryFetching } = useQuery(
        ['restaurant-foods', restaurantId, JSON.stringify(filterByData), priceAndRating?.price?.join('-')],
        () => ProductsApi.products('latest', 1, 1000, 'all', {
            restaurant_id: restaurantId,
            filterByData,
            price: priceAndRating?.price,
        }),
        { enabled: !!restaurantId, keepPreviousData: true }
    )
    const highestPrice = 8000
    const allCategories = useGetAllCategories()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const refs = useRef([])
    const restaurantCategoryIds = restaurantData?.category_ids;
    const [scrollingByClick, setScrollingByClick] = useState(false)
    const { ref, inView } = useInView()
    const isHidden = useHideOnScroll({ threshold: 50 })
    const [removeStickyBanner, setRemoveStickyBanner] = useState(false)
    const handleOnSuccess = (res) => {
        setAllFoods(res?.data?.products)
    }

    const searchFood = useRestaurentFoodSearch(
        restaurantId,
        searchKey,
        handleOnSuccess
    )
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowComponent(false)
        }, 15000)
        return () => clearTimeout(timer)
    }, [])
    useEffect(() => {
        if (searchKey === '' && productsQueryData?.data?.products !== undefined) {
            setAllFoods(productsQueryData?.data?.products)
        }
    }, [productsQueryData, searchKey])

    const clickedOnCategoryRef = useRef(false)

    ///RECOMMEND PRODUCTS API
    const {
        data: recommendProducts,
        refetch: refetchRecommend,
        isRefetching,
        isLoading,
    } = useGetRecommendProducts({
        restaurantId,
        page_limit,
        offset,
        searchKey,
        filterByData,
        price: priceAndRating?.price,
    })
    const { data: popularProducts, refetch: refetchPopular } = usePopularFoods({
        restaurantId,
        page_limit,
        offset,
        searchKey,
    })
    useEffect(() => {
        if (restaurantId) {
            refetchRecommend()
            refetchPopular()
        }
    }, [restaurantId, searchKey, JSON.stringify(filterByData), priceAndRating?.price?.join('-')])
    useEffect(() => {
        setSearchKey('')
        setSelectedId(null)
    }, [restaurantId])

    useEffect(() => {
        const applyPrice = (items) => {
            const [min, max] = priceAndRating?.price || []
            if (min === undefined || max === undefined) return items
            return items?.filter((f) => { const p = Number(f?.price) || 0; return p >= min && p <= max })
        }
        const filteredFoods = applyPrice(allFoods)
        const filteredRecommend = recommendProducts
            ? { ...recommendProducts, products: applyPrice(recommendProducts?.products) }
            : recommendProducts
        const combined = getCombinedCategoriesAndProducts(
            allCategories,
            filteredFoods,
            restaurantCategoryIds,
            filteredRecommend
        )
        const hasProducts = combined?.filter(
            (item) => item?.products?.length > 0
        )
        setData(hasProducts)
        setIsFirstRender(false)
    }, [allFoods, allCategories, recommendProducts, priceAndRating?.price])

    const handleFocusedSection = debounce((val) => {
        if (!clickedOnCategoryRef.current) {
            setSelectedId(val?.id);
        }
        clickedOnCategoryRef.current = false;
    }, 300);

    const handleClick = (val) => {
        clickedOnCategoryRef.current = true;
        setScrollingByClick(true); // <--- NEW
        setSelectedId(val);
    };



    useEffect(() => {
        if (!selectedId) return;
        if (!scrollingByClick) return; // <-- Only scroll when clicking

        const node = refs.current[selectedId];
        if (node) {
            const timeout = setTimeout(() => {
                node.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                });
                setScrollingByClick(false); // After scroll once, reset
            }, 100);

            return () => clearTimeout(timeout);
        }
    }, [selectedId, data, scrollingByClick]); // depend on scrollingByClick

    const handlePrice = (value) => {
        setPriceAndRating((prev) => ({ ...prev, price: value }))
    }

    const handleChangeRatings = (value) => {
        setPriceAndRating((prev) => ({ ...prev, rating: value }))
    }

    const handleReset = () => {
        setCheckedFilterKey(restaurantFoodMockData.map((item) => ({ ...item, isActive: false })))
        setPriceAndRating({ price: [], rating: 0 })
    }

    const handleFilterBy = () => {}
    const handleSearchResult = async (values) => {
        if (values === '') {
            setSearchKey('')
            //setIsSearch('')
        } else {
            setSearchKey(values)
            //  setIsSearch('search')
        }
    }
    const restaurantDiscount = restaurantDiscountTag(
        restaurantData?.discount,
        restaurantData?.free_delivery
    )
    

    return (
        <CustomContainer sx={{ mb: { xs: '7px', md: '0' } }}>
            <CustomStackFullWidth
                pb={isSmall ? '1rem' : '3rem'}
                paddingTop={{ xs: '10px', md: '70px' }}
            >
                {restaurantData && (
                    <TopBanner
                        details={restaurantData}
                        isHidden={isHidden}
                        removeStickyBanner={removeStickyBanner}
                    />
                )}
                <CustomStackFullWidth>
                    {!isFirstRender && (
                        <>
                            <RestaurantCategoryBar
                                data={data}
                                selectedId={selectedId}
                                handleClick={handleClick}
                                isSmall={isSmall}
                                handleSearchResult={handleSearchResult}
                                searchKey={searchKey}
                                isHidden={isHidden}
                                setRemoveStickyBanner={setRemoveStickyBanner}
                                removeStickyBanner={removeStickyBanner}
                                highestPrice={highestPrice}
                                handlePrice={handlePrice}
                                handleChangeRatings={handleChangeRatings}
                                handleReset={handleReset}
                                handleFilterBy={handleFilterBy}
                                checkedFilterKey={checkedFilterKey}
                                setCheckedFilterKey={setCheckedFilterKey}
                                priceAndRating={priceAndRating}
                                activeFilters={activeFilters}
                            />
                           
                            {data?.map((item, index) => {
                                return (
                                    <Box
                                        sx={{ position: 'relative' }}
                                        key={index}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '-340px',
                                            }}
                                            ref={(el) =>
                                                (refs.current[item?.id] = el)
                                            }
                                        />
                                        <CategoriesWiseFood
                                            disRef={ref}
                                            data={item}
                                            handleFocusedSection={
                                                handleFocusedSection
                                            }
                                            indexNumber={index}
                                            restaurantDiscount={
                                                restaurantDiscount
                                            }
                                            hasFreeDelivery={
                                                restaurantData?.free_delivery
                                            }
                                        />
                                    </Box>
                                )
                            })}
                            {(isQueryFetching || isRefetching || data?.length === 0) && (
                                <RestaurentDetailsShimmer
                                    showComponent={isQueryFetching || isRefetching || showComponent}
                                />
                            )}
                        </>
                    )}
                    {!inView && restaurantDiscount && (
                        <FloatingDiscountTag
                            resDiscount={restaurantData?.discount}
                            freeDelivery={restaurantData?.free_delivery}
                            restaurantDiscount={restaurantDiscount}
                        />
                    )}
                </CustomStackFullWidth>
            </CustomStackFullWidth>
        </CustomContainer>
    )
}

export default RestaurantDetails
