import React, { useEffect, useRef, useState } from 'react'
import FoodOrRestaurant from '../../components/products-page/FoodOrRestaurant'
import ProductList from '../products-page/ProductList'
import { useTranslation } from 'react-i18next'
import { Box, Grid, NoSsr, Popover, Stack, Typography, useMediaQuery } from '@mui/material'
import FoodNavigation from '../restaurant-details/foodSection/FoodNavigation'
import { useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import CustomShimmerForBestFood from '../CustomShimmer/CustomShimmerForBestFood'
import CustomShimmerRestaurant from '../CustomShimmer/CustomShimmerRestaurant'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import RestaurantsData from './RestaurantsData'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { noFoodFoundImage, noRestaurantsImage } from '@/utils/LocalImages'
import CustomPageTitle from '../CustomPageTitle'
import CustomDivider from '../CustomDivider'
import FilterButton from '../Button/FilterButton'
import RestaurantFilterCard from '../home/restaurant/RestaurantFilterCard'
import { mockData } from './categoryFilterData'
import { handleFilterData } from './helper'
import { setFoodOrRestaurant } from '@/redux/slices/searchFilter'
import { alpha, useTheme } from '@mui/material/styles'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import CustomNextImage from '@/components/CustomNextImage'
import { onErrorResponse } from '@/components/ErrorResponse'
import { useRouter } from 'next/router'
import { HandleNext, HandlePrev } from '../CustomSliderIcon'

const CategoryDetailsPage = ({
    data,
    id,
    category_id,
    setCategoryId,
    resData,
    offset,
    page_limit,
    type,
    setOffset,
    setType,
    filterByData,
    setFilterByData,
    name,
    priceAndRating,
    setPriceAndRating,
    isLoading,
}) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const [highestPrice, setHighestPrice] = useState(0)
    const open = Boolean(anchorEl)
    const [checkedFilterKey, setCheckedFilterKey] = useState(mockData)
    const { foodOrRestaurant } = useSelector((state) => state.searchFilterStore)
    const [forFilter, setForFilter] = useState(false)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [catetoryMenus, setCategoryMenus] = useState([])
    const sliderRef = useRef(null)
    const { global } = useSelector((state) => state.globalSettings)
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const {
        data: allCategories,
        refetch: refetchCategories,
    } = useQuery(['category-list'], () => CategoryApi.categories(''), {
        enabled: false,
        staleTime: 1000 * 60 * 8,
        onError: onErrorResponse,
        cacheTime: 8 * 60 * 1000,
    })
    const {
        isLoading: isLoadingChilds,
        data: childesData,
        isError,
        error,
        refetch,
    } = useQuery([`category-Childes`, id], () =>
        CategoryApi.categoriesChildes(id)
    )
    useEffect(() => {
        if (childesData && id?.length > 0) {
            setCategoryMenus(childesData.data)
        }
        setCategoryId(id)
    }, [childesData, id])
    useEffect(() => {
        refetchCategories()
    }, [refetchCategories])

    useEffect(() => {
        if (!allCategories?.data?.length || !category_id) return
        const activeIndex = allCategories.data.findIndex(
            (category) =>
                String(category?.id) === String(category_id) ||
                String(category?.slug) === String(category_id)
        )
        if (activeIndex >= 0) {
            sliderRef.current?.slickGoTo(activeIndex)
        }
    }, [allCategories?.data, category_id])
    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }
    const handleDropClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleDropClose = () => {
        setAnchorEl(null)
    }
    const activeFilters = checkedFilterKey?.filter((item) => item?.isActive)
    useEffect(() => {
        handleFilterData(
            checkedFilterKey,
            setFilterByData,
            setOffset,
            setForFilter
        )
    }, [checkedFilterKey])

    const handlePrice = (value) => {
        setPriceAndRating({
            ...priceAndRating,
            price: value,
        })
        setOffset(1)
        setForFilter(true)
    }
    const handleChangeRatings = (value) => {
        setPriceAndRating({
            ...priceAndRating,
            rating: value,
        })
        setForFilter(true)
    }
    const getFoodOrRestaurant = (value) => {
        setFoodOrRestaurant(value)
    }
    useEffect(() => {
        if (foodOrRestaurant === 'restaurants') {
            setOffset(1)
        }
    }, [foodOrRestaurant])
    useEffect(() => {
        if (data && isFirstRender) {
            //const getHighestPrice = Math?.max(...data?.data?.products?.map(food => food.price));
            setHighestPrice(data?.data?.max_price)
            setIsFirstRender(false) // Set isFirstRender to false after the first render
        }
        return () => {
            setIsFirstRender(true)
        }
    }, [data, id])

    const handleReset = () => {
        const data = checkedFilterKey?.map((item) => ({
            ...item,
            isActive: false,
        }))
        setCheckedFilterKey(data)
        setPriceAndRating({
            price: [],
            rating: 0,
        })
    }

    // Reset filters when category changes
    const isInitialMount = useRef(true)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
        const resetData = mockData.map((item) => ({
            ...item,
            isActive: false,
        }))
        setCheckedFilterKey(resetData)
        setPriceAndRating({ price: [], rating: 0 })
        setOffset(1)
    }, [id])

    const handleCategoryClick = (category) => {
        router.push(
            {
                pathname: `/category/${category?.slug || category?.id}`,
                
            },
            undefined,
            { shallow: true }
        )
    }
    const isDarkMode = theme.palette.mode === 'dark'

    const categorySliderSettings = {
        dots: false,
        infinite: allCategories?.data?.length > 6,
        speed: 600,
        slidesToShow: 8,
        slidesToScroll: 2,
        autoplay: false,
        arrows: true,
        nextArrow: <HandleNext right="-1.6%" />,
        prevArrow: <HandlePrev left="-1.6%" />,
       // centerMode: true,
      //  centerPadding: '40px',
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 2,
                    infinite: allCategories?.data?.length > 5,
                    centerPadding: '30px',
                },
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 2,
                    infinite: allCategories?.data?.length > 4,
                    //centerPadding: '24px',
                },
            },
            {
                breakpoint: 700,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 2,
                    infinite: allCategories?.data?.length > 3,
                    //centerPadding: '18px',
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: allCategories?.data?.length > 2,
                    //centerPadding: '14px',
                },
            },
        ],
    }

    return (
        <NoSsr>
            <Grid container spacing={{ xs: 1, sm: 3, md: 2 }}>
                {false && (
                <Grid item md={12} sm={12} xs={12} align="center" key="category-top-slider-removed">
                    {allCategories?.data?.length > 0 && (
                        <Box
                            sx={{
                                position: 'relative',
                                overflow: 'visible',
                                px: { xs: 0, md: 1 },
                                '& .slick-slider': {
                                    position: 'relative',
                                },
                                '& .slick-track': {
                                    WebkitTransform: 'translateZ(0)',
                                    transform: 'translateZ(0)',
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden',
                                },
                                '& .slick-slide > div': {
                                    px: { xs: '6px', sm: '10px' },
                                    WebkitTransform: 'translateZ(0)',
                                    transform: 'translateZ(0)',
                                    WebkitBackfaceVisibility: 'hidden',
                                    backfaceVisibility: 'hidden',
                                },
                                '& .slick-list': {
                                    paddingTop: '20px !important',
                                    paddingBottom: '20px !important',
                                },
                            }}
                        >
                            <Slider
                                key={`category-slider-${theme.palette.mode}`}
                                {...categorySliderSettings}
                                ref={sliderRef}
                            >
                                {allCategories.data.map((category) => {
                                    const isActiveCategory =
                                        String(category?.slug || category?.id) ===
                                        String(id)
                                    const activeShadow = isDarkMode
                                        ? '0px 8px 20px rgba(0, 0, 0, 0.6)'
                                        : '0px 8px 20px rgba(78, 80, 84, 0.22)'
                                    const inactiveShadow = isDarkMode
                                        ? '0px 8px 18px rgba(0, 0, 0, 0.45)'
                                        : '0px 3px 6px rgb(159 159 159 / 12%)'
                                    const activeBackground = isDarkMode
                                        ? alpha(theme.palette.primary.main, 0.35)
                                        : alpha(theme.palette.primary.main, 0.3)
                                    const inactiveBackground = isDarkMode
                                        ? theme.palette.neutral[800]
                                        : theme.palette.neutral[100]
                                    return (
                                        <Box
                                            key={category?.id}
                                            onClick={() =>
                                                handleCategoryClick(category)
                                            }
                                            sx={{
                                                cursor: 'pointer',
                                                borderRadius: '10px',
                                                backgroundColor:
                                                    isActiveCategory
                                                        ? activeBackground
                                                        : inactiveBackground,
                                                width: '120px',
                                                height: '96px',
                                                boxShadow: isActiveCategory
                                                    ? activeShadow
                                                    : inactiveShadow,

                                                px: '16px',
                                                py: '10px',
                                                transition:
                                                    'transform 0.2s ease, box-shadow 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow:
                                                        isDarkMode
                                                            ? '0px 14px 28px rgba(0, 0, 0, 0.65)'
                                                            : '0px 14px 28px rgba(16, 24, 40, 0.12)',
                                                },
                                            }}
                                        >
                                            <Stack
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Box
                                                    sx={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '50%',
                                                        overflow: 'hidden',
                                                        backgroundColor:
                                                            isActiveCategory
                                                                ? theme.palette.neutral[100]
                                                                : theme.palette.neutral[200],
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <CustomNextImage
                                                        src={
                                                            category?.image_full_url
                                                        }
                                                        alt={category?.name}
                                                        width={92}
                                                        height={92}
                                                        objectFit="cover"
                                                        borderRadius="50%"
                                                    />
                                                </Box>
                                                <Typography
                                                    fontSize={{
                                                        xs: '14px',
                                                    }}
                                                    fontWeight="500"
                                                    color={
                                                        isActiveCategory
                                                            ? theme.palette.primary.main
                                                            : theme.palette.neutral[1000]
                                                    }
                                                    textAlign="center"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {category?.name}
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    )
                                })}
                            </Slider>
                        </Box>
                    )}
                </Grid>
                )}
                <Grid item xs={12} sm={12} md={12} align="center">
                    <NoSsr>
                        <CustomStackFullWidth
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <FoodOrRestaurant
                                foodOrRestaurant={foodOrRestaurant}
                                setFoodOrRestaurant={setFoodOrRestaurant}
                                isRestaurant
                            />
                            { catetoryMenus?.length === 0 && (
                                <FilterButton
                                    id="fade-button"
                                    handleClick={handleDropClick}
                                    activeFilters={activeFilters}
                                />
                            )}
                        </CustomStackFullWidth>
                        
                    </NoSsr>
                </Grid>
                <Grid item xs={12} sm={12} md={12} align="left" mt="0rem">
                    <CustomStackFullWidth
                        direction="row"
                        justifyContent={
                            catetoryMenus?.length > 0
                                ? 'space-between'
                                : 'flex-end'
                        }
                        alignItems="center"
                        gap={{ xs: 1, sm: 1.5 }}
                        sx={{ minWidth: 0 }}
                    >
                        {catetoryMenus?.length > 0 && (
                            <Box
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    overflow: 'hidden',
                                }}
                            >
                                <FoodNavigation
                                    catetoryMenus={catetoryMenus}
                                    setCategoryId={setCategoryId}
                                    category_id={category_id}
                                    id={id}
                                />
                            </Box>
                        )}
                        {catetoryMenus?.length > 0  && (
                            <Box sx={{ flexShrink: 0 }}>
                                <FilterButton
                                    id="fade-button"
                                    handleClick={handleDropClick}
                                    activeFilters={activeFilters}
                                />
                            </Box>
                        )}
                    </CustomStackFullWidth>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    container
                    spacing={{
                        xs: 1,
                        md: 2,
                    }}
                >
                    {foodOrRestaurant === 'products' &&
                        (data?.data ? (
                            <>
                                <ProductList
                                    product_list={data?.data}
                                    offset={offset}
                                    page_limit={page_limit}
                                    setOffset={setOffset}
                                />
                                {data?.data?.products.length === 0 && (
                                    <CustomEmptyResult
                                        image={noFoodFoundImage}
                                        label=" No Food Found"
                                    />
                                )}
                            </>
                        ) : (
                            <CustomShimmerForBestFood />
                        ))}

                    {foodOrRestaurant === 'restaurants' &&
                        (resData ? (
                            <>
                                <RestaurantsData
                                    resData={resData}
                                    offset={offset}
                                    page_limit={20}
                                    setOffset={setOffset}
                                    global={global}
                                />
                                {resData.data.total_size === 0 && (
                                    <CustomStackFullWidth sx={{ mt: '10px' }}>
                                        <CustomEmptyResult
                                            image={noRestaurantsImage}
                                            label="No Restaurants Found"
                                        />
                                    </CustomStackFullWidth>
                                )}
                            </>
                        ) : (
                            <>
                                <CustomShimmerRestaurant />
                            </>
                        ))}
                </Grid>
            </Grid>
            <Popover
                onClose={() => handleDropClose()}
                id="fade-button"
                open={open}
                anchorEl={anchorEl}
                disableScrollLock={true}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    zIndex: 999,
                }}
                disableRestoreFocus
            >
                <RestaurantFilterCard
                    mockData={mockData}
                    rowWise
                    checkboxData={checkedFilterKey}
                    handleDropClose={handleDropClose}
                    anchorEl={anchorEl}
                    highestPrice={highestPrice}
                    setFilterByData={setFilterByData}
                    //handleFilter={handleFilter}
                    //handleClearAll={handleClearAll}
                    setCheckedFilterKey={setCheckedFilterKey}
                    foodOrRestaurant={foodOrRestaurant}
                    handlePrice={handlePrice}
                    handleChangeRatings={handleChangeRatings}
                    priceAndRating={priceAndRating}
                    handleReset={handleReset}
                />
            </Popover>
        </NoSsr>
    )
}

export default CategoryDetailsPage
