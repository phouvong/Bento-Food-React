import React, { useEffect, useRef, useState } from 'react'
import {
    alpha,
    Grid,
    IconButton,
    Popover,
    Typography,
    Box,
    Stack,
} from '@mui/material'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { CategoryButton } from './restaurant-details.style'
import { styled, useTheme } from '@mui/material/styles'
import FilterButton from '../Button/FilterButton'
import RestaurantFilterCard from '../home/restaurant/RestaurantFilterCard'
import { RTL } from '../RTL/RTL'
import SearchIcon from '@mui/icons-material/Search'
import { t } from 'i18next'
import CustomSearch from '../custom-search/CustomSearch'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useInView } from 'react-intersection-observer'
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const CustomBox = styled(Box)(({ theme }) => ({
    width: '100%',
    overflow: 'auto',
    cursor: 'pointer',
    '&::-webkit-scrollbar': {
        height: '0px',
    },
    [theme.breakpoints.down('md')]: {
        '&::-webkit-scrollbar': {
            height: '0px',
        },
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: theme.palette.whiteContainer.main,
        borderRadius: 10,
        opacity: 0,
        zIndex: -1,
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.neutral[300],
        borderRadius: 10,
        opacity: 0,
        transition: 'opacity 0.2s',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: theme.palette.neutral[100],
    },
    '&:hover': {
        '&::-webkit-scrollbar-thumb': {
            opacity: 0,
        },
    },
}))

const RestaurantCategoryBar = (props) => {
    const {
        data,
        selectedId,
        handleClick,
        isSmall,
        handleSearchResult,
        searchKey,
        isHidden,
        setRemoveStickyBanner,
        removeStickyBanner,
        highestPrice,
        handlePrice,
        handleChangeRatings,
        handleReset,
        handleFilterBy,
        checkedFilterKey,
        setCheckedFilterKey,
        priceAndRating,
        activeFilters,
    } = props
    const [searchBoxOpen, setSearchBoxOpen] = useState(false)
    const theme = useTheme()

    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)
    const refs = useRef([])
    const scrollerRef = useRef(null)
    const [showLeftBtn, setShowLeftBtn] = useState(false)
    const [showRightBtn, setShowRightBtn] = useState(false)
    const handleDropClick = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const handleDropClose = () => {
        setAnchorEl(null)
    }
    useEffect(() => {
        if (selectedId && refs.current[selectedId]) {
            const selectedButton = refs.current[selectedId]
            const scrollerLeft =
                scrollerRef.current.getBoundingClientRect().left
            const buttonLeft = selectedButton.getBoundingClientRect().left
            const offset =
                buttonLeft -
                scrollerLeft +
                (selectedButton.offsetWidth - scrollerRef.current.offsetWidth) /
                2
            scrollerRef.current.scrollLeft = offset
        }
    }, [selectedId])

    const updateScrollButtonVisibility = () => {
        const scroller = scrollerRef.current
        if (!scroller) return

        const { scrollLeft, scrollWidth, clientWidth } = scroller
        const maxScrollLeft = scrollWidth - clientWidth

        setShowLeftBtn(scrollLeft > 0)
        // Only show right button when content overflows and we are not at the end
        setShowRightBtn(maxScrollLeft > 2 && scrollLeft < maxScrollLeft - 2)
    }

    useEffect(() => {
        updateScrollButtonVisibility()

        const currentScroller = scrollerRef.current
        if (currentScroller) {
            currentScroller.addEventListener(
                'scroll',
                updateScrollButtonVisibility
            )
            window.addEventListener('resize', updateScrollButtonVisibility)
        }

        return () => {
            if (currentScroller) {
                currentScroller.removeEventListener(
                    'scroll',
                    updateScrollButtonVisibility
                )
                window.removeEventListener('resize', updateScrollButtonVisibility)
            }
        }
    }, [])

    // Recalculate when categories change (e.g., after API load)
    useEffect(() => {
        const raf = requestAnimationFrame(updateScrollButtonVisibility)
        return () => cancelAnimationFrame(raf)
    }, [data])

    let languageDirection = undefined
    if (typeof window !== 'undefined') {
        languageDirection = localStorage.getItem('direction')
    }

    const handleSearchBox = () => {
        setSearchBoxOpen(!searchBoxOpen)
    }
    const isActiveCategoryBar = (item, index) => {
        if (selectedId !== null) {
            if (selectedId === item?.id) {
                return 'true'
            } else {
                return 'false'
            }
        } else {
            if (index === 0) {
                return 'true'
            }
        }
    }
    const { ref, inView } = useInView({
        rootMargin: '-130px 0px 0px 0px',
    })
    
    useEffect(() => {
        if (inView) {
            setRemoveStickyBanner(false)
        } else {
            setRemoveStickyBanner(true)
        }
    }, [inView]);
    console.log({inView,removeStickyBanner});
    
    
    return (
        <RTL direction={languageDirection}>
            <Grid
                container
                spacing={1}
                ref={ref}
                sx={{
                    position: 'sticky',
                    top: {
                        xs: '179px',
                        sm: '140px',
                        md: isHidden ? '163px' : 'calc(163px + 58px)',
                    },
                    background: (theme) => theme.palette.neutral[1800],
                    padding: '10px 0px 5px',
                    zIndex: 998,
                    transition: 'all 0.25s ease',
                }}
                alignItems="center"
            >
                <Grid item xs={8} sm={9} md={7} sx={{ position: 'relative' }}>
                    {isSmall && searchBoxOpen ? (
                        <Stack sx={{ animation: 'fadeInRight 1s  1' }}>
                            <CustomSearch
                                borderRadius="5px"
                                handleSearchResult={handleSearchResult}
                                label={t('Search foods')}
                                searchFrom="restaurantDetails"
                                selectedValue={searchKey}
                            />
                        </Stack>
                    ) : (
                        <CustomBox ref={scrollerRef}>
                            {showLeftBtn && (
                                <IconButton
                                    sx={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor:
                                            theme.palette.neutral[100],
                                        boxShadow: `0px 5px 10px rgba(0, 0, 0, 0.1)`,
                                        position: 'absolute',
                                        top: 'calc(50% + 2.5px)',
                                        transform: 'translateY(-50%)',
                                        left: '0px',
                                        zIndex: 999,
                                        '&:hover': {
                                            backgroundColor:
                                                theme.palette.neutral[100],
                                        },
                                    }}
                                    onClick={() => {
                                        if (scrollerRef.current) {
                                            scrollerRef.current.scrollBy({
                                                left: -200,
                                                behavior: 'smooth',
                                            })
                                        }
                                    }}
                                >
                                    <ChevronLeftIcon fontSize="small" />
                                </IconButton>
                            )}
                            <CustomStackFullWidth direction="row">
                                {data?.map((item, index) => {
                                    return (
                                        <CategoryButton
                                            key={item?.id}
                                            id={item?.id}
                                            ref={(el) =>
                                                (refs.current[item?.id] = el)
                                            }
                                            onClick={() =>
                                                handleClick(item?.id)
                                            }
                                            active={isActiveCategoryBar(
                                                item,
                                                index
                                            )}
                                        >
                                            <Typography
                                                fontSize={{
                                                    xs: '11px',
                                                    sm: '14px',
                                                    md: '14px',
                                                }}
                                                fontWeight={
                                                    selectedId === item?.id
                                                        ? '500'
                                                        : '400'
                                                }
                                                color={
                                                    theme.palette.neutral[900]
                                                }
                                            >
                                                {item?.name}
                                            </Typography>
                                        </CategoryButton>
                                    )
                                })}
                            </CustomStackFullWidth>
                            {showRightBtn && (
                                <IconButton
                                    sx={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor:
                                            theme.palette.neutral[100],
                                        boxShadow: `0px 5px 10px rgba(0, 0, 0, 0.1)`,
                                        position: 'absolute',
                                        top: 'calc(50% + 2.5px)',
                                        transform: 'translateY(-50%)',
                                        left: 'auto',
                                        right: 0,
                                        zIndex: 999,
                                        '&:hover': {
                                            backgroundColor:
                                                theme.palette.neutral[100],
                                        },
                                    }}
                                    onClick={() => {
                                        if (scrollerRef.current) {
                                            scrollerRef.current.scrollBy({
                                                left: 200,
                                                behavior: 'smooth',
                                            })
                                        }
                                    }}
                                >
                                    <ChevronRightIcon fontSize="small" />
                                </IconButton>
                            )}
                        </CustomBox>
                    )}
                </Grid>

                <Grid
                    item
                    xs={4}
                    sm={3}
                    md={5}
                    align={languageDirection === 'rtl' ? 'left' : 'right'}
                    marginBottom={{ xs: '0px', md: '8px' }}
                >
                    <Stack
                        direction="row"
                        width="100%"
                        sx={{ marginInlineStart: 'auto' }}
                    >
                        {!isSmall && (
                            <Stack
                                sx={{
                                    backgroundColor:
                                        theme.palette.neutral[1800],
                                    marginInlineStart: 'auto',
                                }}
                            >
                                <CustomSearch
                                    //key={reRenderSearch}
                                    handleSearchResult={handleSearchResult}
                                    label={t('Search foods')}
                                    //isLoading={isLoadingSearchFood}
                                    searchFrom="restaurantDetails"
                                    selectedValue={searchKey}
                                    backgroundColor={theme.palette.neutral[200]}
                                    borderRadius="10px"
                                />
                            </Stack>
                        )}

                        <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                            alignItems="center"
                            paddingLeft="15px"
                            marginInlineStart="auto"
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                justifySelf="flex-end"
                            >
                                {isSmall && (
                                    <IconButton
                                        onClick={handleSearchBox}
                                        sx={{
                                            background: (theme) =>
                                                alpha(
                                                    theme.palette.primary.main,
                                                    0.3
                                                ),
                                            borderRadius: '6px',
                                            padding: '3px',
                                            fontSize: '16px',
                                            minWidth: 32,
                                            height: 32,
                                            }}
                                    >
                                        {!searchBoxOpen ? (
                                            <SearchIcon
                                                fontSize="18px"
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette.primary
                                                            .main,
                                                }}
                                            />
                                        ) : (
                                            <ArrowForwardIosIcon
                                                fontSize="18px"
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette.primary
                                                            .main,
                                                }}
                                            />
                                        )}
                                    </IconButton>
                                )}
                                <FilterButton
                                    handleClick={handleDropClick}
                                    height="32px"
                                    activeFilters={activeFilters}
                                />
                            </Stack>
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
            <Popover
                onClose={() => handleDropClose()}
                id="fade-button"
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                sx={{
                    zIndex: 999,
                }}
            >
                <RestaurantFilterCard
                    rowWise
                    foodOrRestaurant="products"
                    checkboxData={checkedFilterKey}
                    handleDropClose={handleDropClose}
                    anchorEl={anchorEl}
                    setCheckedFilterKey={setCheckedFilterKey}
                    handleChangeRatings={handleChangeRatings}
                    priceAndRating={priceAndRating}
                    handleReset={handleReset}
                    highestPrice={highestPrice}
                    handlePrice={handlePrice}
                    handleFilterBy={handleFilterBy}
                    only_food={true}
                />
            </Popover>
        </RTL>
    )
}

export default RestaurantCategoryBar
