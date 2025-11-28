import React, { useEffect, useRef, useState } from 'react'
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
    borderBottom: `1px solid ${theme.palette.borderBottomBg}`,
    gap: '10px',
    padding: '0 16px',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
        display: 'none',
    },
    '&::-webkit-scrollbar-track': {
        display: 'none',
    },
}))

const CustomTab = styled('button')(({ theme, active }) => ({
    background: 'none',
    border: 'none',
    padding: '16px 16px',
    minWidth: '120px',
    whiteSpace: 'nowrap',
    textTransform: 'none',
    fontWeight: '400',
    fontSize: '14px',
    cursor: 'pointer',
    flexShrink: 0,
    borderBottom: '2px solid',
    borderBottomColor: active ? theme.palette.primary.main : 'transparent',
    color: active
        ? theme.palette.primary.main
        : theme.palette.customColor?.six || theme.palette.text.secondary,
    '&:hover': {
        opacity: 0.8,
    },
}))

const DifferentFoodCompontent = ({
    campaignIsloading,
    isLoading,
    isLoadingNearByPopularRestaurantData,
}) => {
    const { isSticky } = useSelector((state) => state.scrollPosition)
    const [activeSection, setActiveSection] = useState(null)
    const parentScrollContainerRef = useRef(null)
    const tabContainerRef = useRef(null)
    const [filterType, setFilterType] = useState(null)
    const [shouldUpdateActiveSection, setShouldUpdateActiveSection] =
        useState(true)

    const scrollTabIntoView = (activeValue) => {
        if (tabContainerRef.current && activeValue) {
            const activeTabIndex = foodTabData.findIndex(item => item.value === activeValue)
            if (activeTabIndex !== -1) {
                const tabContainer = tabContainerRef.current
                const tabWidth = 120 + 10 // minWidth + gap
                const scrollPosition = activeTabIndex * tabWidth
                tabContainer.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                })
            }
        }
    }

    const updateActiveSection = () => {
        if (!shouldUpdateActiveSection) return

        const sections = foodTabData.map(item => ({
            id: item.value,
            element: document.getElementById(item.value)
        })).filter(section => section.element)

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

        if (currentSection !== activeSection) {
            setActiveSection(currentSection)
            setFilterType(currentSection)
            scrollTabIntoView(currentSection)
        }
    }
    const handleScroll = () => {
        updateActiveSection()
    }

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
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const activeTab = activeSection || filterType
    return (
        <Stack marginTop="10px">
            <Stack
                sx={{
                    position: 'sticky',
                    top: { xs: '90px', md: '65px' },
                    zIndex: { xs: "94", md:"99", },
                    background: (theme) => theme.palette.neutral[1800],
                }}
            >
                <CustomTabContainer ref={tabContainerRef}>
                    {foodTabData?.map((item) => {
                        return (
                            <CustomTab
                                key={item?.id}
                                active={activeTab === item?.value}
                                onClick={() => {
                                    setFilterType(item.value)
                                    setActiveSection(item.value)
                                    setShouldUpdateActiveSection(false)
                                    scrollToSection(item?.value)
                                    // Re-enable scroll detection after a delay
                                    setTimeout(() => {
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
            <div ref={parentScrollContainerRef}>
                <ScrollSpy>
                    <div id={foodTabData[0]?.value}>
                        <FoodCampaign isLoading={campaignIsloading} />
                    </div>
                    <div id={foodTabData[1]?.value}>
                        <NearbyPopularFood
                            isLoading={isLoadingNearByPopularRestaurantData}
                        />
                    </div>
                    <div id={foodTabData[2]?.value}>
                        <BestReviewedFood isLoading={isLoading} />
                    </div>
                </ScrollSpy>
            </div>
        </Stack>
    )
}

export default DifferentFoodCompontent
