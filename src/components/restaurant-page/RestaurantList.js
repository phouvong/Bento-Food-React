import { RestaurantsApi } from '@/hooks/react-query/config/restaurantApi'
import { Box, Chip, Grid, Popover } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
//import LinearProgress from '@mui/material/LinearProgress'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'react-i18next'
import CustomePagination from '../pagination/Pagination'

import { noRestaurantsImage } from '@/utils/LocalImages'
import { Stack } from '@mui/system'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import FilterButton from '../Button/FilterButton'
import CustomDivider from '../CustomDivider'
import CustomShimmerRestaurant from '../CustomShimmer/CustomShimmerRestaurant'
import { onErrorResponse } from '../ErrorResponse'
import PageSearchWithTitle from '../category/PageSearchWithTitle'
import { handleFilterData } from '../category/helper'
import CustomEmptyResult from '../empty-view/CustomEmptyResult'
import RestaurantFilterCard from '../home/restaurant/RestaurantFilterCard'
import { mockData } from './restaurantpageData'
import { useRouter } from 'next/router'

const RestaurantList = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const [checkedFilterKey, setCheckedFilterKey] = useState(mockData)
    const [filterByData, setFilterByData] = useState({})
    const [forFilter, setForFilter] = useState(false)
    const [page_limit, setPageLimit] = useState(20)
    const [offset, setOffset] = useState(1)
    const [searchKey, setSearchKey] = useState('')
    const [anchorEl, setAnchorEl] = useState(null)
    const [filterBy, setFilterBy] = useState([])
    const open = Boolean(anchorEl)
    const { global } = useSelector((state) => state.globalSettings)
    const [priceAndRating, setPriceAndRating] = useState({
        price: [],
        rating: 0,
    })
    const [languageDirection, setLanguageDirection] = React.useState('ltr')
    useEffect(() => {
        if (localStorage.getItem('direction')) {
            setLanguageDirection(localStorage.getItem('direction'))
        }
    }, [])

    useEffect(() => {
        if (offset !== undefined) {
            const url = `/restaurants?page=${offset}`
            window.history.replaceState(null, '', url)
        }
    }, [offset])

    const { isLoading, data, isError, error, refetch, isRefetching } = useQuery(
        [
            'all-restaurants',
            offset,
            page_limit,
            filterByData,
            priceAndRating,
            filterBy,
        ],
        () =>
            RestaurantsApi.restaurants({
                offset,
                page_limit,
                searchKey,
                filterByData,
                priceAndRating,
                filterBy,
            }),
        {
            onError: onErrorResponse,
        }
    )

    useEffect(() => {
        handleFilterData(
            checkedFilterKey,
            setFilterByData,
            setOffset,
            setForFilter
        )
    }, [checkedFilterKey])

    useEffect(() => {
        const apiRefetch = async () => {
            await refetch()
        }

        apiRefetch()
    }, [searchKey])

    const handleSearchResult = async (values) => {
        if (values === '') {
            await refetch()
            setSearchKey('')
        } else {
            //setType('all')
            setSearchKey(values)
        }
    }

    const handleDropClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleDropClose = () => {
        setAnchorEl(null)
    }
    const getSelectedFilter = checkedFilterKey?.filter((item) => item?.isActive)
    const handleDelete = (chipItem) => {
        const tempData = checkedFilterKey?.map((items) =>
            items?.value === chipItem?.value
                ? { ...items, isActive: false }
                : items
        )
        setCheckedFilterKey(tempData)
        setFilterBy((prev) =>
            prev?.filter((value) => value !== chipItem?.value)
        )
    }

    const handleChangeRatings = (value) => {
        setPriceAndRating({
            ...priceAndRating,
            rating: value,
        })
        setForFilter(true)
    }
    const handleReset = () => {
        const data = checkedFilterKey?.map((item) => ({
            ...item,
            isActive: false,
        }))
        setCheckedFilterKey(data)
        setFilterBy([])
        setPriceAndRating({
            price: [],
            rating: 0,
        })
        //handleDropClose()
    }
    const handleFilterBy = (value) => {
        setFilterBy(value)
    }
    console.log({ priceAndRating, filterBy })

    return (
        <>
            {languageDirection && (
                <Box mb="1rem">
                    <Grid
                        container
                        spacing={{ xs: 1, sm: 2, md: 2 }}
                        alignItems="center"
                        justifyContent="center"
                       // mt="1rem"
                    >
                        <Grid item md={12} sm={12} xs={12}>
                            <PageSearchWithTitle
                                handleSearchResult={handleSearchResult}
                                label="Search restaurants..."
                                action={
                                    <FilterButton
                                        id="fade-button"
                                        handleClick={handleDropClick}
                                        activeFilters={getSelectedFilter}
                                        height="42px"
                                    />
                                }
                            />
                        </Grid>
                        {/* {getSelectedFilter?.length > 0 && (
                            <Grid item md={12} align="right" sm={12} xs={12}>
                                <CustomStackFullWidth
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center"
                                    spacing={1}
                                >
                                    <SimpleBar style={{ width: '100%' }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            justifyContent={{
                                                xs: 'flex-start',
                                                sm: 'flex-start',
                                                md: 'flex-end',
                                            }}
                                            alignItems="center"
                                        >
                                            {getSelectedFilter?.map((item) => (
                                                <Chip
                                                    sx={{
                                                        fontWeight: '400',
                                                        color: theme.palette
                                                            .neutral[500],
                                                        fontSize: '12px',
                                                        padding: '0px 5px',
                                                        height: '30px',
                                                        '.MuiChip-deleteIcon': {
                                                            color: `${theme.palette.neutral[400]} !important`,
                                                        },
                                                    }}
                                                    label={item?.name}
                                                    variant="outlined"
                                                    onDelete={() =>
                                                        handleDelete(item)
                                                    }
                                                />
                                            ))}
                                        </Stack>
                                    </SimpleBar>
                                </CustomStackFullWidth>
                            </Grid>
                        )} */}

                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            container
                            spacing={{ xs: 1, sm: 2, md: 3 }}
                            marginTop={{ xs: '0rem', md: '.1rem' }}
                        >
                            {data?.data?.restaurants?.map((restaurantData) => {
                                if (restaurantData) {
                                    return (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={4}
                                            md={3}
                                            key={restaurantData?.id}
                                        >
                                            <NewStoreCard
                                                restaurant={{
                                                    ...restaurantData,
                                                    opening_time:
                                                        restaurantData?.current_opening_time,
                                                }}
                                            />
                                        </Grid>
                                    )
                                }
                            })}
                            {isLoading && <CustomShimmerRestaurant />}
                            {data?.data?.restaurants?.length === 0 && (
                                <CustomEmptyResult
                                    label="No Restaurants found"
                                    image={noRestaurantsImage}
                                />
                            )}
                        </Grid>
                        {data?.data?.restaurants?.length > 0 && (
                            <Grid item xs={12} sm={12} md={12}>
                                <CustomePagination
                                    total_size={data?.data?.total_size}
                                    page_limit={page_limit}
                                    offset={offset}
                                    setOffset={setOffset}
                                />
                            </Grid>
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
                            foodOrRestaurant="restaurants"
                            checkboxData={checkedFilterKey}
                            handleDropClose={handleDropClose}
                            anchorEl={anchorEl}
                            // setFilterByData={setFilterByData}
                            //handleFilter={handleFilter}
                            setCheckedFilterKey={setCheckedFilterKey}
                            handleChangeRatings={handleChangeRatings}
                            priceAndRating={priceAndRating}
                            handleReset={handleReset}
                            handleFilterBy={handleFilterBy}
                        />
                    </Popover>
                </Box>
            )}
        </>
    )
}

export default RestaurantList
