import React, { useEffect, useRef, useState } from 'react'
import {
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
import SearchBox from '../home/hero-section-with-search/SearchBox'
import { useInView } from 'react-intersection-observer'
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CustomSearch from '../custom-search/CustomSearch'
import { t } from 'i18next'

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
        handleSearchResult
    } = props
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
                scrollerRef.current.scrollLeft
            scrollerRef.current.scrollTo({
                left: Math.max(0, offset),
                behavior: 'smooth',
            })
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

    // Detect when the sticky bar reaches its mobile stick-top (190px) so we
    // can break it out of the parent Container only while it's stuck.
    const { ref: stickySentinelRef, inView: stickySentinelInView } = useInView({
        rootMargin: '-190px 0px 0px 0px',
    })
    const isMobileStuck = isSmall && !stickySentinelInView

    useEffect(() => {
        // Skip the sticky-banner-removal dance on mobile — the banner is no longer
        // fixed there, so this state isn't read by TopBanner on small viewports.
        if (isSmall) return
        if (inView) {
            setRemoveStickyBanner(false)
        } else {
            setRemoveStickyBanner(true)
        }
    }, [inView, isSmall])


    return (
        <RTL direction={languageDirection}>
            <Box ref={stickySentinelRef} sx={{ height: '1px', marginBottom: '-1px' }} />
            <Grid
                container
                spacing={{ xs: 0, sm: 1 }}
                rowSpacing={{ xs: 0.5, sm: 0 }}
                ref={ref}
                sx={{
                    position: 'sticky',
                    top: {
                        xs: 'calc(var(--restaurant-fixed-top-bottom, 190px) + (-12px))',
                        sm: '140px',
                        md: isHidden ? '162px' : '203px',
                    },
                    background: (theme) => theme.palette.neutral[1800],
                    padding: { xs: '8px 8px', md: '10px 0px 5px' },
                    ...(isMobileStuck && {
                        marginLeft: '-16px',
                        marginRight: '-16px',
                        width: 'calc(100% + 32px)',
                        maxWidth: 'none',
                    }),
                    zIndex: 100,
                    transition: 'top 0.25s ease, box-shadow 0.25s ease',
                }}
                alignItems="center"
            >
                <Grid
                    item
                    xs={12}
                    sm={9}
                    md={7}
                    order={{ xs: 1, sm: 1 }}
                    sx={{ position: 'relative' }}
                >
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
                                        zIndex: 9999,
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
                                                    xs: '13px',
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
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={3}
                    md={5}
                    order={{ xs: 2, sm: 2 }}
                    align={languageDirection === 'rtl' ? 'left' : 'right'}
                    marginBottom={{ xs: '0px', md: '8px' }}
                >
                    <Stack
                        direction="row"
                        width="100%"
                        spacing={1}
                        alignItems="center"
                        sx={{ marginInlineStart: 'auto' }}
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

                        <FilterButton
                            handleClick={handleDropClick}
                            height="32px"
                            activeFilters={activeFilters}
                        />
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
