import React, { useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import { Box, Chip, Grid, Popover, Stack } from '@mui/material'
import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import ProductList from './ProductList'
import { AnimationDots } from './AnimationDots'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import { noFoodFoundImage } from '@/utils/LocalImages'
import { onErrorResponse } from '../ErrorResponse'
import { t } from 'i18next'
import CustomPageTitle from '../CustomPageTitle'
import FilterButton from '../Button/FilterButton'
import { useTheme } from '@mui/material/styles'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import RestaurantFilterCard from '../home/restaurant/RestaurantFilterCard'
import { useRouter } from 'next/router'

const mockData = [
    { id: 0, name: 'Veg', value: 'veg', isActive: false },
    { id: 1, name: 'Non Veg', value: 'nonVeg', isActive: false },
    { id: 2, name: 'Default', value: 'default', isActive: false },
    { id: 3, name: 'Fast Delivery', value: 'fast_delivery', isActive: false },
    { id: 4, name: 'A to Z', value: 'a_to_z', isActive: false },
    { id: 5, name: 'Z to A', value: 'z_to_a', isActive: false },
    { id: 10, name: 'Rating 5+', value: 'rating5', isActive: false },
    { id: 11, name: 'Rating 4+', value: 'rating4', isActive: false },
    { id: 12, name: 'Rating 3+', value: 'rating3', isActive: false },
    { id: 13, name: 'Discounted', value: 'discounted', isActive: false },
    { id: 15, name: 'New Arrivals', value: 'new_arrivals', isActive: false },
    { id: 16, name: 'Currently Available', value: 'currently_available', isActive: false },
    { id: 17, name: 'Halal', value: 'halal', isActive: false },
]

const normalizeToken = (value = '') =>
    value.toString().replace(/[_\s-]/g, '').toLowerCase()

const getSelectedRatingFromFilters = (filters = []) => {
    const hasRatingFive = filters?.some((item) => {
        const token = normalizeToken(item?.value || item?.name)
        return token === 'rating5' || token === 'toprated'
    })
    if (hasRatingFive) return 5
    const hasRatingFour = filters?.some(
        (item) => normalizeToken(item?.value || item?.name) === 'rating4'
    )
    if (hasRatingFour) return 4
    const hasRatingThree = filters?.some(
        (item) => normalizeToken(item?.value || item?.name) === 'rating3'
    )
    if (hasRatingThree) return 3
    return ''
}

const PopularFoodOnlyComponent = ({
    configData,
    title = 'Popular Foods',
    productType = 'popular',
}) => {
    const router = useRouter()
    const theme = useTheme()
    const hasMounted = useRef(false)
    const getPageOffset = (pageValue) => {
        const page = Number(pageValue)
        if (Number.isInteger(page) && page > 0) return page
        return 1
    }
    const [page_limit] = useState(15)
    const [offset, setOffset] = useState(() => getPageOffset(router?.query?.page))
    const [type] = useState('all')
    const [anchorEl, setAnchorEl] = useState(null)
    const [checkedFilterKey, setCheckedFilterKey] = useState(mockData)
    const [filterBy, setFilterBy] = useState([])
    const [priceAndRating, setPriceAndRating] = useState({
        price: [],
        rating: 0,
    })

    const open = Boolean(anchorEl)
    const activeFilters = checkedFilterKey?.filter((item) => item?.isActive)
    const activeFilterValues = activeFilters?.map((item) => item?.value)
    const selectedRating = getSelectedRatingFromFilters(activeFilters)
    const priceKey =
        Array.isArray(priceAndRating?.price) && priceAndRating?.price?.length > 0
            ? priceAndRating?.price?.join('-')
            : ''

    const {
        data,
        isLoading,
        isFetching,
        isRefetching,
        isError,
        error,
    } = useQuery(
        [
            'products-only-list',
            productType,
            offset,
            page_limit,
            type,
            activeFilterValues?.join(','),
            filterBy?.join(','),
            selectedRating,
            priceKey,
        ],
        () =>
            ProductsApi.products(productType, offset, page_limit, type, {
                activeFilters: activeFilterValues,
                filterBy,
                price: priceAndRating?.price,
                rating: selectedRating || priceAndRating?.rating || '',
            }),
        {
            onError: onErrorResponse,
        }
    )
    const resolvedTotalSize = Number(
        data?.data?.total_size ??
            data?.data?.totalSize ??
            data?.data?.total ??
            data?.headers?.['x-total-count'] ??
            data?.headers?.['x-total'] ??
            0
    )
    const productListData = {
        ...(data?.data || {}),
        total_size: Number.isFinite(resolvedTotalSize) ? resolvedTotalSize : 0,
    }

    if (isError) {
        return <h1>{error?.messages || t('Something went wrong')}</h1>
    }

    const handleDropClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleDropClose = () => {
        setAnchorEl(null)
    }
    const handleDelete = (chipItem) => {
        const tempData = checkedFilterKey?.map((items) =>
            items?.id === chipItem?.id
                ? { ...items, isActive: false }
                : items
        )
        setCheckedFilterKey(tempData)
        setFilterBy((prev) =>
            prev?.filter((value) => value !== chipItem?.value)
        )
    }

    const handlePrice = (value) => {
        setPriceAndRating((prev) => ({
            ...prev,
            price: value,
        }))
    }

    const handleChangeRatings = (value) => {
        setPriceAndRating((prev) => ({
            ...prev,
            rating: value,
        }))
    }

    const handleReset = () => {
        const resetData = checkedFilterKey?.map((item) => ({
            ...item,
            isActive: false,
        }))
        setCheckedFilterKey(resetData)
        setFilterBy([])
        setPriceAndRating({
            price: [],
            rating: 0,
        })
    }

    const handleFilterBy = (value) => {
        setFilterBy(value)
    }

    useEffect(() => {
        const queryPage = getPageOffset(router?.query?.page)
        if (queryPage !== offset) {
            setOffset(queryPage)
        }
    }, [router?.query?.page, offset])

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true
            return
        }
        setOffset(1)
    }, [checkedFilterKey, priceAndRating])
    const highestPrice =
        Number(data?.data?.max_price) ||
        Math.ceil(
            Math.max(
                0,
                ...(data?.data?.products || []).map(
                    (item) => Number(item?.price) || 0
                )
            )
        )

    return (
        <>
            <CustomStackFullWidth
                mb="5rem"
                paddingTop="5rem"
                sx={{ minHeight: '70vh' }}
            >
                <Box mb="1rem">
                    <CustomStackFullWidth
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <CustomPageTitle title={title} />
                        <FilterButton
                            id="fade-button"
                            handleClick={handleDropClick}
                            activeFilters={activeFilters}
                        />
                    </CustomStackFullWidth>
                    {activeFilters?.length > 0 && (
                        <SimpleBar style={{ width: '100%' }}>
                            <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                                alignItems="center"
                            >
                                {activeFilters?.map((item) => (
                                    <Chip
                                        key={item?.id}
                                        sx={{
                                            fontWeight: '400',
                                            color: theme.palette.neutral[500],
                                            fontSize: '12px',
                                            padding: '0px 5px',
                                            height: '30px',
                                            '.MuiChip-deleteIcon': {
                                                color: `${theme.palette.neutral[400]} !important`,
                                            },
                                        }}
                                        label={t(item?.name)}
                                        variant="outlined"
                                        onDelete={() => handleDelete(item)}
                                    />
                                ))}
                            </Stack>
                        </SimpleBar>
                    )}
                </Box>
                <Grid item xs={12} sm={12} md={12} container spacing={2}>
                    {isLoading || isFetching || isRefetching ? (
                        <Stack width="100%" minHeight="500px">
                            <AnimationDots align="center" />
                        </Stack>
                    ) : (
                        <>
                            {data?.data?.products?.length > 0 ? (
                                <ProductList
                                    product_list={productListData}
                                    offset={offset}
                                    page_limit={page_limit}
                                    setOffset={setOffset}
                                />
                            ) : (
                                <CustomEmptyResult
                                    label="No food found"
                                    image={noFoodFoundImage}
                                />
                            )}
                        </>
                    )}
                </Grid>
                <Popover
                    onClose={() => handleDropClose()}
                    id="fade-button"
                    open={open}
                    anchorEl={anchorEl}
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
                        top: '5px',
                    }}
                    disableScrollLock={true}
                    disableRestoreFocus
                >
                    <RestaurantFilterCard
                        mockData={mockData}
                        rowWise
                        checkboxData={checkedFilterKey}
                        handleDropClose={handleDropClose}
                        anchorEl={anchorEl}
                        setCheckedFilterKey={setCheckedFilterKey}
                        handleChangeRatings={handleChangeRatings}
                        priceAndRating={priceAndRating}
                        handleReset={handleReset}
                        foodOrRestaurant="products"
                        handlePrice={handlePrice}
                        highestPrice={highestPrice}
                        handleFilterBy={handleFilterBy}
                        only_food={true}
                    />
                </Popover>
            </CustomStackFullWidth>
        </>
    )
}

export default PopularFoodOnlyComponent
