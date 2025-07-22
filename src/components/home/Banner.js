import React, { useEffect, useState } from 'react'
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
import { HandleNext, HandlePrev } from '../CustomSliderIcon'

const FoodDetailModal = dynamic(() =>
    import('../foodDetail-modal/FoodDetailModal')
)

const Banner = ({ isFetched, data }) => {
    const router = useRouter()
    const { banners } = useSelector((state) => state.storedData)
    const [allBanners, setAllBanners] = useState()
    const [FoodBannerData, setFoodBannerData] = useState(null)
    const bannerData = allBanners?.concat(banners?.campaigns)
    const [openModal, setOpenModal] = useState(false)
    const { global } = useSelector((state) => state.globalSettings)
    const [hoverOn, setHoverOn] = useState(false)
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
                    pathname: '/restaurant/[id]',
                    query: {
                        id: `${
                            banner?.restaurant?.slug
                                ? banner?.restaurant?.slug
                                : banner?.restaurant?.id
                        }`,
                    },
                },
                undefined,
                { shallow: true }
            )
        } else if (banner?.available_date_ends) {
            router.push(
                {
                    pathname: `campaigns/${
                        banner?.slug ? banner?.slug : banner?.id
                    }`,
                },
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
        dots: true,
        nextArrow: hoverOn && <HandleNext />,
        prevArrow: hoverOn && <HandlePrev />,
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
        ...(data?.data?.campaigns || [])
    ];
    const bData = mergeBanner || bannerData;

    return (
        <CustomStackFullWidth
            sx={{
                paddingTop: {
                    xs: bData?.length > 0 && '15px',
                    md: bData?.length > 0 && '10px',
                },
                paddingBottom: { xs: '30px', md: '20px' },
            }}
        >
            <SliderCustom
                gap=".8rem"
                onMouseEnter={() => setHoverOn(true)}
                onMouseLeave={() => setHoverOn(false)}
                sx={{minHeight:{xs:"165px",md:"185px"}}}
            >
                {isFetched ? (
                    <Slider {...bannerSettings}>
                        {bData?.slice(0, 8).map((banner) => {
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
                            return (
                                <BannerCard
                                    key={i}
                                    onlyShimmer
                                />
                            )
                        })}
                    </Slider>
                )}
            </SliderCustom>
            {FoodBannerData && openModal && (
                <FoodDetailModal
                    product={FoodBannerData}
                    image={`${global?.base_urls?.product_image_url}/${FoodBannerData?.image}`}
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
