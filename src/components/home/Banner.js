import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    CustomStackFullWidth,
    SliderCustom,
} from '@/styled-components/CustomStyles.style'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import BannerCard from './Banner/BannerCard'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useSelector } from 'react-redux'
import Skeleton from '@mui/material/Skeleton'
import { handleBadge } from '@/utils/customFunctions'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import SliderSectionHeader from '@/components/slider-section-header/SliderSectionHeader'

const FoodDetailModal = dynamic(() =>
    import('../foodDetail-modal/FoodDetailModal')
)

export const SLIDE_GAP = '20px'

const Banner = ({ isFetched, data }) => {
    const router = useRouter()
    const { t } = useTranslation()
    const sliderRef = useRef(null)
    const { banners } = useSelector((state) => state.storedData)
    const [allBanners, setAllBanners] = useState()
    const [FoodBannerData, setFoodBannerData] = useState(null)
    const bannerData = allBanners?.concat(banners?.campaigns)
    const [openModal, setOpenModal] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)
    const [activeSlide, setActiveSlide] = useState(0)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const slideGap = isMobile ? '10px' : SLIDE_GAP
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }

    useEffect(() => {
        const foodBanners = banners?.banners?.filter(
            (item) => item?.type === 'item_wise'
        )
        const isOldVariations = foodBanners?.filter(
            (ite) =>
                ite?.food?.variations === null ||
                ite?.food?.variations[0]?.values ||
                ite?.food?.variations?.length === 0
        )

        const restaurantBanners = banners?.banners?.filter(
            (item) => item?.type === 'restaurant_wise'
        )

        setAllBanners(isOldVariations?.concat(restaurantBanners))
    }, [banners])

    const handleBannerClick = (banner) => {
        if (banner.type === 'restaurant_wise') {
            router.push(
                {
                    pathname: `/restaurants/${banner?.restaurant?.slug || banner?.restaurant?.id}`,
                },
                undefined,
                { shallow: true }
            )
        } else if (banner?.available_date_ends) {
            router.push(
                {pathname: `campaigns/${banner?.slug || banner?.id}`},
                undefined,
                { shallow: true }
            )
        } else {
            setFoodBannerData(banner?.food)
            setOpenModal(true)
        }
    }
    const handleModalClose = () => {
        setOpenModal(false)
        setFoodBannerData(null)
    }

    const bannerSettings = {
        infinite: bannerData?.length > 3,
        speed: 600,
        slidesToShow: 3,
        autoplay: true,
        dots: false,
        arrows: false,
        beforeChange: (_, next) => setActiveSlide(next),
        responsive: [
            {
                breakpoint: 1450,
                settings: {
                    slidesToShow: 3,
                    infinite: bannerData?.length > 3,
                    autoplay: true,
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2.3,
                    infinite: bannerData?.length > 3,
                    autoplay: true,
                },
            },
            {
                breakpoint: 850,
                settings: {
                    slidesToShow: 1.7,
                    infinite: bannerData?.length > 3,
                    autoplay: true,
                    centerMode: true,
                },
            },
            {
                breakpoint: 790,
                settings: {
                    slidesToShow: 1.5,
                    infinite: bannerData?.length > 3,
                    dots: true,
                    autoplay: true,
                    centerMode: true,
                    centerPadding: '100px',
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1.5,
                    dots: true,
                    autoplay: true,
                    centerMode: true,
                    centerPadding: '80px',
                },
            },
            {
                breakpoint: 500,
                settings: {
                    slidesToShow: 1,
                    initialSlide: 1,
                    dots: true,
                    autoplay: true,
                    centerMode: true,
                    centerPadding: '30px',
                },
            },
        ],
    }
    const mergeBanner = [
        ...(data?.data?.banners || []),
        ...(data?.data?.campaigns || []),
    ]
    const bData = mergeBanner || bannerData;
    const displayBanners = bData?.slice(0, 8) || []
    const totalBanners = displayBanners.length

    return (
        <CustomStackFullWidth sx={{marginTop:{xs:"16px", md: "23px"}}} >
            <SliderSectionHeader
                title={t('Find Best Restaurants and Foods')}
                subtitle={t(
                    'Discover what fits your mood — filter, explore, and order in a tap.'
                )}
                titleComponent="h1"
                sliderRef={sliderRef}
                itemsCount={totalBanners}
                viewAllText={t('See all offers')}
                onViewAll={() => router.push('/campaigns')}
            />
            <SliderCustom gap={slideGap}>
                {isFetched ? (
                    <Slider {...bannerSettings} ref={sliderRef}>
                        {displayBanners.map((banner) => {
                            return (
                                <BannerCard
                                    banner={banner}
                                    key={banner?.id}
                                    handleBannerClick={handleBannerClick}
                                />
                            )
                        })}
                    </Slider>
                ) : (
                    <Slider {...bannerSettings}>
                        {[...Array(4)].map((i) => {
                            return <BannerCard key={i} onlyShimmer />
                        })}
                    </Slider>
                )}
              
            </SliderCustom>
            {FoodBannerData && openModal && (
                <FoodDetailModal
                    product={FoodBannerData}
                    image={FoodBannerData?.image_full_url}
                    open={openModal}
                    handleModalClose={handleModalClose}
                    setOpen={setOpenModal}
                    currencySymbolDirection={currencySymbolDirection}
                    currencySymbol={currencySymbol}
                    digitAfterDecimalPoint={digitAfterDecimalPoint}
                    handleBadge={handleBadge}
                />
            )}
        </CustomStackFullWidth>
    )
}

export default Banner
