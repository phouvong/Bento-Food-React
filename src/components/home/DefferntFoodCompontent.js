import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import FoodCampaign from './food-campaign/FoodCampaign'
import BestReviewedFood from './food-campaign/best-reviewed-foods/BestReviewedFood'
import NearbyPopularFood from './new-popular-food/NearbyPopularFood'
import { styled, Stack } from '@mui/material'
import { t } from 'i18next'
import { foodTabData } from './foodTabData'
import ScrollSpy from 'react-ui-scrollspy'
import { useSelector } from 'react-redux'

const CustomTabContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    overflowX: 'auto',
    overflowY: 'hidden',
    gap: '8px',
    padding: '8px 0',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
    '&::-webkit-scrollbar-track': {
        display: 'none',
    },
}))

const CustomTab = styled('button')(({ theme, active }) => ({
    border: `1px solid ${active ? theme.palette.primary.main : theme.palette.neutral[300]}`,
    padding: '9px 18px',
    whiteSpace: 'nowrap',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
    borderRadius: '100px',
    backgroundColor: active
        ? theme.palette.primary.main
        : theme.palette.neutral[100],
    color: active ? '#fff' : theme.palette.neutral[900],
    boxShadow: active
        ? '0 4px 12px rgba(255, 121, 24, 0.25)'
        : 'none',
    transform: active ? 'translateY(-1px)' : 'translateY(0)',
    transition:
        'background-color 0.22s ease, color 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
    '&:hover': {
        backgroundColor: active
            ? theme.palette.primary.main
            : theme.palette.neutral[200],
        borderColor: active
            ? theme.palette.primary.main
            : theme.palette.neutral[400],
    },
}))

const DifferentFoodCompontent = ({
    campaignIsloading,
    isLoading,
    isLoadingNearByPopularRestaurantData,
}) => {
    const [activeSection, setActiveSection] = useState(null)
    const parentScrollContainerRef = useRef(null)
    const tabContainerRef = useRef(null)
    const [filterType, setFilterType] = useState(null)
    const [shouldUpdateActiveSection, setShouldUpdateActiveSection] =
        useState(true)
    const {
        campaignFoods,
        bestReviewedFoods,
        popularFood,
    } = useSelector((state) => state.storedData)

    const visibleFoodTabs = useMemo(() => {
        const hasCampaignFoods = (campaignFoods?.length ?? 0) > 0
        const hasPopularFood = (popularFood?.length ?? 0) > 0
        const hasBestReviewedFoods = (bestReviewedFoods?.length ?? 0) > 0

        return foodTabData.filter((tab) => {
            if (tab.value === 'todays-trends') return hasCampaignFoods
            if (tab.value === 'popular-foods') return hasPopularFood
            if (tab.value === 'best-reviewed') return hasBestReviewedFoods
            return true
        })
    }, [
        campaignFoods?.length,
        popularFood?.length,
        bestReviewedFoods?.length,
    ])

    const shouldUpdateActiveSectionRef = useRef(shouldUpdateActiveSection)
    useEffect(() => {
        shouldUpdateActiveSectionRef.current = shouldUpdateActiveSection
    }, [shouldUpdateActiveSection])

    const activeSectionRef = useRef(activeSection)
    useEffect(() => {
        activeSectionRef.current = activeSection
    }, [activeSection])

    const scrollTabIntoView = useCallback(
        (activeValue) => {
            if (!tabContainerRef.current || !activeValue) return
            const activeTabIndex = visibleFoodTabs.findIndex(
                (item) => item.value === activeValue
            )
            if (activeTabIndex === -1) return

            const tabContainer = tabContainerRef.current
            const tabWidth = 120 + 10 // minWidth + gap
            const scrollPosition = activeTabIndex * tabWidth
            tabContainer.scrollTo({
                left: scrollPosition,
                behavior: 'smooth',
            })
        },
        [visibleFoodTabs]
    )

    const updateActiveSection = useCallback(() => {
        if (!shouldUpdateActiveSectionRef.current) return

        const sections = visibleFoodTabs
            .map((item) => ({
                id: item.value,
                element: document.getElementById(item.value),
            }))
            .filter((section) => section.element)

        const scrollPosition = window.scrollY + 250

        // Find the current section based on scroll position
        let currentSection = null

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i]
            if (scrollPosition >= section.element.offsetTop) {
                currentSection = section.id
                break
            }
        }

        if (currentSection !== activeSectionRef.current) {
            setActiveSection(currentSection)
            setFilterType(currentSection)
            scrollTabIntoView(currentSection)
        }
    }, [scrollTabIntoView, visibleFoodTabs])

    const handleScroll = useCallback(() => {
        updateActiveSection()
    }, [updateActiveSection])

    const scrollToSection = (sectionId) => {
        const target = document.getElementById(sectionId)
        if (target) {
            const headerOffset = 200
            const elementPosition =
                target.getBoundingClientRect().top + window.scrollY
            const offsetPosition = elementPosition - headerOffset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            })
        }
    }
    useEffect(() => {
        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [handleScroll])

    const activeTab = activeSection || filterType
    return (
        <Stack marginTop="10px">
            {visibleFoodTabs?.length > 0 && (
                <Stack
                    sx={{
                        position: 'sticky',
                        top: { xs: '45px', md: '60px' },
                        zIndex: { xs: '94', md: '99' },
                        background: (theme) => theme.palette.neutral[1800],
                    }}
                >
                    <CustomTabContainer ref={tabContainerRef}>
                        {visibleFoodTabs?.map((item) => {
                            return (
                                <CustomTab
                                    key={item?.id}
                                    active={activeTab === item?.value}
                                    onClick={() => {
                                        setFilterType(item.value)
                                        setActiveSection(item.value)
                                        shouldUpdateActiveSectionRef.current =
                                            false
                                        setShouldUpdateActiveSection(false)
                                        scrollToSection(item?.value)
                                        // Re-enable scroll detection after a delay
                                        setTimeout(() => {
                                            shouldUpdateActiveSectionRef.current =
                                                true
                                            setShouldUpdateActiveSection(true)
                                        }, 1000)
                                    }}
                                >
                                    {t(item?.category_name)}
                                </CustomTab>
                            )
                        })}
                    </CustomTabContainer>
                </Stack>
            )}
            <div ref={parentScrollContainerRef}>
                <ScrollSpy>
                    {visibleFoodTabs?.map((tab) => {
                        if (tab.value === 'todays-trends') {
                            return (
                                <div key={tab.value} id={tab.value}>
                                    <FoodCampaign
                                        isLoading={campaignIsloading}
                                    />
                                </div>
                            )
                        }
                        if (tab.value === 'popular-foods') {
                            return (
                                <div key={tab.value} id={tab.value}>
                                    <NearbyPopularFood
                                        isLoading={
                                            isLoadingNearByPopularRestaurantData
                                        }
                                    />
                                </div>
                            )
                        }
                        if (tab.value === 'best-reviewed') {
                            return (
                                <div key={tab.value} id={tab.value}>
                                    <BestReviewedFood isLoading={isLoading} />
                                </div>
                            )
                        }
                        return null
                    })}
                </ScrollSpy>
            </div>
        </Stack>
    )
}

export default DifferentFoodCompontent
