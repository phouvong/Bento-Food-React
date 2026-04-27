import React, { useEffect, useState } from 'react'

import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import FilterTag from './FilterTag'
import { useRouter } from 'next/router'
import { useTheme } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import CustomContainer from '../../container'
import { searchMockData } from '../../products-page/SearchMockData'
import {
    setFilterbyByCuisineDispatch,
    setFilterbyByDispatch,
    setPriceByDispatch,
    setRatingByDispatch,
    setSortbyByDispatch,
} from '@/redux/slices/searchFilter'
import { setSearchTagData } from '@/redux/slices/searchTagSlice'

const SearchFilterTag = ({
    tags,
    query,
    page,
    sort_by,
    setSort_by,
    restaurantType,
}) => {
    const dispatch = useDispatch()

    const { searchTagData } = useSelector((state) => state.searchTags)
    const [storeData, setStoreData] = useState(searchMockData)
    const [isMount, setIsMount] = useState(false)
    const router = useRouter()
    const theme = useTheme()

    useEffect(() => {
        dispatch(setSearchTagData(storeData))
    }, [searchMockData])

    // Hydrate filter tags and sort_by from URL query params on load/back-forward
    useEffect(() => {
        if (!router.isReady) return

        const filtersParam = router.query.filters
        const sortByParam = router.query.sort_by

        const activeValues = filtersParam
            ? String(filtersParam).split(',').filter(Boolean)
            : []

        const hydrated = searchMockData.map((item) => ({
            ...item,
            isActive:
                activeValues.includes(item.value) ||
                (Boolean(sortByParam) && item.value === 'sort_by'),
        }))

        setStoreData(hydrated)

        const activeFromUrl = hydrated.filter((item) => item.isActive)
        dispatch(setFilterbyByDispatch(activeFromUrl))
        dispatch(
            setSortbyByDispatch(sortByParam ? String(sortByParam) : '')
        )
        if (sortByParam && setSort_by) {
            setSort_by(String(sortByParam))
        }
    }, [router.isReady, router.query.filters, router.query.sort_by])

    const handleClick = (value) => {
        if (value !== 'sort_by') {
            let newArr
            if (value === 'veg' || value === 'nonVeg') {
                // Toggle the isActive state for 'Veg' and 'Non-Veg' without affecting others
                newArr = searchTagData?.map((item) =>
                    item.value === value
                        ? { ...item, isActive: !item.isActive }
                        : item.value === 'veg' || item.value === 'nonVeg'
                            ? { ...item, isActive: false }
                            : item
                )
            } else {
                // For other options, toggle the isActive state
                newArr = searchTagData?.map((item) =>
                    item.value === value
                        ? { ...item, isActive: !item.isActive }
                        : item
                )
            }

            setIsMount(true)
            setStoreData(newArr)
        }
    }

    const handleSort = (value) => {
        if (value !== '') {
            setSort_by(value)
            const tempValue = value && 'sort_by'
            let newArr = searchTagData?.map((item) =>
                item?.value === tempValue ? { ...item, isActive: true } : item
            )
            setIsMount(true)
            setStoreData(newArr)
        }
    }
    const activeFilters = storeData?.filter((item) => item.isActive === true)
    const handleFilterBy = () => {
        dispatch(setFilterbyByDispatch(activeFilters))
        dispatch(setSortbyByDispatch(sort_by))

        const activeFilterValues = activeFilters
            ?.filter((item) => item.value !== 'sort_by')
            .map((item) => item.value)

        // Prepare query parameters
        const queryParams = {
            tags: 'search_tag',
            query: query || '',
            ...(restaurantType === 'dine-in' && { restaurantType: 'dine-in' }), // Conditionally add restaurantType
            ...(activeFilterValues?.length > 0 && {
                filters: activeFilterValues.join(','),
            }),
            ...(sort_by && { sort_by }),
        }

        // Perform routing
        if (tags !== 'search_tag') {
            router.push(
                {
                    pathname:
                        router.pathname === '/home'
                            ? window.location.pathname
                            : '/search',
                    query: queryParams,
                },
                undefined,
                { shallow: router.pathname === '/home' }
            )
        } else {
            // Already on /search — update URL params in place
            router.replace(
                {
                    pathname: router.pathname,
                    query: queryParams,
                },
                undefined,
                { shallow: true }
            )
        }
    }

    useEffect(() => {
        if (isMount) {
            handleFilterBy()
        }
    }, [storeData])

    useEffect(() => {
        dispatch(setSearchTagData(storeData))
    }, [storeData, isMount])

    useEffect(() => {
        if (query) {
            setStoreData(searchMockData)
        }
    }, [query])

    return (
        <CustomStackFullWidth spacing={2}>
            <Card
                sx={{
                   boxShadow: 'none',
                    paddingBottom: '1rem',
                    paddingTop: '12px',
                    background: (theme) => theme.palette.neutral[1800],
                    [theme.breakpoints.down('md')]: {
                        paddingTop: '.5rem',
                        paddingBottom: '.5rem',
                    },
                }}
            >
                <CustomContainer>
                    <FilterTag
                        handleClick={handleClick}
                        query={query}
                        tags={tags}
                        storeData={storeData}
                        setStoreData={setStoreData}
                        handleSort={handleSort}
                        activeFilters={activeFilters}
                        page={page}
                        restaurantType={restaurantType}
                        homePage
                    />
                </CustomContainer>
            </Card>
        </CustomStackFullWidth>
    )
}

export default SearchFilterTag
