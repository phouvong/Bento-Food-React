import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box, Stack } from '@mui/material'
import TopBanner from './HeadingBannerSection/TopBanner'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import CustomContainer from '../container'
import RestaurantCategoryBar from './RestaurantCategoryBar'
import { useGetAllProductsOfARestaurant } from '@/hooks/custom-hooks/useGetAllProductsOfARestaurant'
import { useGetAllCategories } from '@/hooks/custom-hooks/useGetAllCategories'
import CategoriesWiseFood from './CategoriesWiseFood'
import { isAvailable, restaurantDiscountTag } from '@/utils/customFunctions'
import RestaurentDetailsShimmer from './RestaurantShimmer/RestaurentDetailsShimmer'
import { useGetRecommendProducts } from '@/hooks/react-query/config/useGetRecommendProduct'
import { debounce } from 'lodash'
import CustomSearch from '../custom-search/CustomSearch'
import { t } from 'i18next'
import { useRestaurentFoodSearch } from '@/hooks/custom-hooks/useRestaurentFoodSearch'
import { usePopularFoods } from '@/hooks/react-query/restaurants/usePopularFoods'
import { useInView } from 'react-intersection-observer'
import FloatingDiscountTag from '@/components/restaurant-details/FloatingDiscountTag'

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
        const data = allCategories?.map((item) => {
            const categoryItems = allProducts?.filter(
                (product) => product?.category_ids[0]?.id == item?.id
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

const RestaurantDetails = ({ restaurantData, configData }) => {
    const [data, setData] = useState([])
    const [allFoods, setAllFoods] = useState([])
    const [page_limit, setPageLimit] = useState(50)
    const [offset, SetOffSet] = useState(1)
    const [selectedId, setSelectedId] = useState(null)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [showComponent, setShowComponent] = useState(true)
    const [checkFilter, setCheckFilter] = useState(false)
    const [filterKey, setFilterKey] = useState({})
    const [searchKey, setSearchKey] = useState('')
    const restaurantId = restaurantData?.id
    const allProducts = useGetAllProductsOfARestaurant(restaurantId)
    const allCategories = useGetAllCategories()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const refs = useRef([])
    const restaurantCategoryIds = restaurantData?.category_ids;
    const [scrollingByClick, setScrollingByClick] = useState(false)
    const { ref, inView } = useInView()
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
        if (searchKey === '') {
            setAllFoods(allProducts)
        }
    }, [allProducts, searchKey])

    const clickedOnCategoryRef = useRef(false)

    ///RECOMMEND PRODUCTS API
    const {
        data: recommendProducts,
        refetch: refetchRecommend,
        isRefetching,
        isLoading,
    } = useGetRecommendProducts({ restaurantId, page_limit, offset, searchKey })
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
    }, [restaurantId, searchKey])
    useEffect(() => {
        setSearchKey('')
        setSelectedId(null)
    }, [restaurantId])

    useEffect(() => {
        const combined = getCombinedCategoriesAndProducts(
            allCategories,
            allFoods,
            restaurantCategoryIds,
            recommendProducts
            // popularProducts
        )

        const hasProducts = combined?.filter(
            (item) => item?.products?.length > 0
        )
        setData(hasProducts)
        //setSelectedId(hasProducts?.[0]?.id)
        setIsFirstRender(false)
    }, [allFoods, allCategories, recommendProducts])

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

    // useEffect(() => {
    //     if (refs.current.length > 0) {
    //         if (selectedId) {
    //             refs.current[selectedId]?.scrollIntoView({
    //                 behavior: 'smooth',
    //             })
    //         }
    //     }
    // }, [selectedId])

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

    const handleFilter = () => {
        setCheckFilter((prevState) => !prevState)
    }

    useEffect(() => {
        handleFilteredData()
    }, [checkFilter])

    const handleFilteredData = () => {
        const {
            discount: filterDiscount,
            nonVeg: filterNonVeg,
            veg: filterVeg,
            currentlyAvailable: filterAvailable
        } = filterKey || {}

        const combined = getCombinedCategoriesAndProducts(
            allCategories,
            allFoods,
            restaurantCategoryIds,
            recommendProducts
        )

        const filteredData = combined
            ?.map((category) => {
                const filteredProducts = category.products?.filter((food) => {
                    if (filterDiscount && food.discount <= 0) return false
                    if (filterNonVeg && food.veg !== 0) return false
                    if (filterVeg && food.veg !== 1) return false
                    if (filterAvailable && !isAvailable(food.available_time_starts, food.available_time_ends)) return false

                    return true
                })

                return {
                    ...category,
                    products: filteredProducts
                }
            })
            ?.filter((category) => category.products?.length > 0)

        setData(filteredData)
    }
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
                {restaurantData && <TopBanner details={restaurantData} />}
                <CustomStackFullWidth>
                    {!isFirstRender && (
                        <>
                            <RestaurantCategoryBar
                                handleFilter={handleFilter}
                                filterKey={filterKey}
                                setFilterKey={setFilterKey}
                                data={data}
                                selectedId={selectedId}
                                handleClick={handleClick}
                                isSmall={isSmall}
                                handleSearchResult={handleSearchResult}
                                searchKey={searchKey}
                            />
                            {!isSmall && (
                                <Stack
                                    sx={{
                                        backgroundColor: (theme) =>
                                            theme.palette.neutral[1800],
                                        position: 'sticky',
                                        zIndex: 998,
                                        maxWidth: '100%',
                                        width: '50%',
                                        alignSelf: 'flex-end',
                                        marginTop: '1.4rem',
                                        top: {
                                            xs: '199px',
                                            sm: '270px',
                                            md: '233px',
                                        },
                                    }}
                                >
                                    <CustomSearch
                                        //key={reRenderSearch}
                                        handleSearchResult={handleSearchResult}
                                        label={t('Search foods')}
                                        //isLoading={isLoadingSearchFood}
                                        searchFrom="restaurantDetails"
                                        selectedValue={searchKey}
                                        backgroundColor={
                                            theme.palette.neutral[200]
                                        }
                                        borderRadius="10px"
                                    />
                                </Stack>
                            )}
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
                            {data?.length === 0 && (
                                <RestaurentDetailsShimmer
                                    showComponent={showComponent}
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
