import React, { useEffect, useRef, useState } from 'react'

import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import FilterTag from './FilterTag'
import { useRouter } from 'next/router'
import { useTheme } from '@emotion/react'
import { useDispatch, useSelector } from 'react-redux'
import Card from '@mui/material/Card'
import { alpha } from '@mui/material/styles'
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
    const isUpdatingFromClick = useRef(false)

    useEffect(() => {
        dispatch(setSearchTagData(storeData))
    }, [searchMockData])

    // Hydrate filter tags and sort_by from URL query params on load/back-forward
    useEffect(() => {
        if (!router.isReady) return

        // Skip hydration if URL change was triggered by our own click handler
        if (isUpdatingFromClick.current) {
            isUpdatingFromClick.current = false
            return
        }

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

    const handleClick = (value, event) => {
        if (event && typeof event.stopPropagation === 'function') {
            event.stopPropagation()
        }
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
        isUpdatingFromClick.current = true
        dispatch(setFilterbyByDispatch(activeFilters))
        dispatch(setSortbyByDispatch(sort_by))

        const activeFilterValues = activeFilters
            ?.filter((item) => item.value !== 'sort_by')
            .map((item) => item.value)

        const hasContent =
            Boolean(query) ||
            activeFilterValues?.length > 0 ||
            Boolean(sort_by) ||
            restaurantType === 'dine-in'

        // Prepare query parameters - only include tags when there's actual content
        const queryParams = hasContent
            ? {
                  tags: 'search_tag',
                  ...(query && { query }),
                  ...(restaurantType === 'dine-in' && {
                      restaurantType: 'dine-in',
                  }),
                  ...(activeFilterValues?.length > 0 && {
                      filters: activeFilterValues.join(','),
                  }),
                  ...(sort_by && { sort_by }),
              }
            : {}

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
                    paddingBottom: '10px',
                    paddingTop: '10px',
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? alpha(theme.palette.background.paper, 0.92)
                            : 'rgba(250,250,247,0.92)',
                    backdropFilter: 'saturate(180%) blur(10px)',
                    borderBottom: (theme) =>
                        `1px solid ${
                            theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.08)'
                                : '#E2E8F0'
                        }`,
                    borderRadius: 0,
                    WebkitTapHighlightColor: 'transparent',
                    //transition: 'all 0.3s ease-in-out',
                    '& *': {
                        WebkitTapHighlightColor: 'transparent',
                    },
                    [theme.breakpoints.down('md')]: {
                        paddingTop: '8px',
                        paddingBottom: '8px',
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
