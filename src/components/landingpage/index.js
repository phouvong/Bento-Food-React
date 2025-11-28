import CssBaseline from '@mui/material/CssBaseline'
import { useDispatch, useSelector } from 'react-redux'
import HeroSection from './HeroSection'
import FunFactSection from './FunFactSection'
import BannerSection from './BannerSection'
import DownloadSection from './DownloadSection'
import AvailableZoneSection from './AvailableZoneSection'
import CookiesConsent from '../CookiesConsent'
import LinkSection from '@/components/landingpage/link-section/LinkSection'
import DailyFreshChoice from '@/components/landingpage/DailyFreshChoice'
import OrderFood from '@/components/landingpage/OrderFood'
import FoodCategories from '@/components/landingpage/FoodCategories'
import LandingFaQ from '@/components/landingpage/LandingFaQ'
import Statistics from '@/components/landingpage/Statistics'
import Testimonial from '@/components/landingpage/Testimonial'
import { useEffect } from 'react'
import { setLandingPageData } from '@/redux/slices/storedData'
import { setGlobalSettings } from '@/redux/slices/global'

const LandingPage = ({ global, landingPageData }) => {
    const dispatch = useDispatch()
    console.log({ global });

    useEffect(() => {
        if (global) {
            dispatch(setGlobalSettings(global))
        }
        if (landingPageData) {
            dispatch(setLandingPageData(landingPageData))
        }
    }, [global, landingPageData])

    const { landingPageData: storedLandingData } = useSelector(
        (state) => state.storedData
    )
    const data = landingPageData || storedLandingData


    return (
        <>
            <CssBaseline />
            <HeroSection
                banner_section_title={data?.header_section?.react_header_title}
                banner_section_subTitle={
                    data?.header_section?.react_header_sub_title
                }
                banner_section_image={
                    data?.header_section?.react_header_image_full_url
                }
                place_holder_search_text={data?.header_section?.react_header_location_picker_title}
            />

            <Statistics
                avg_delivery={
                    data?.header_section
                        ?.react_header_floating_icon_average_delivery
                }
                total_restaurant={
                    data?.header_section?.react_header_floating_icon_restaurant
                }
                total_customer={
                    data?.header_section?.react_header_floating_icon_customer
                }
            />
            {data?.react_service_status ? (
                <FunFactSection react_feature={data?.react_services} />
            ) : null}
            {Number(data?.stepper_section?.stepper_section_status) === 1 ? (
                <OrderFood stepperSection={data?.stepper_section} />
            ) : null}

            {data?.react_promotional_banner_status ? (
                <BannerSection
                    banner_section_half={data?.react_promotional_banner}
                />
            ) : null}
            {data?.category_section?.category_section_status === "1" ? (
                <FoodCategories category_section={data?.category_section} />
            ) : null}

            {data?.download_app_section.download_app_section_status && (data?.download_app_section?.react_download_apps_play_store
                ?.react_download_apps_play_store_status === '1' ||
                data?.download_app_section?.react_download_apps_app_store
                    ?.react_download_apps_link_status === '1') ? (
                <DownloadSection
                    download_app_data={data?.download_app_section}
                    landing_page_links={data?.landing_page_links}
                />
            ) : null}
            {data?.gallery_section?.gallery_section_status === '1' ? (
                <DailyFreshChoice gallery_section={data?.gallery_section} />
            ) : null}

            {data?.available_zone_status === 1 &&
                data?.available_zone_list?.length > 0 && (
                    <AvailableZoneSection landingPageData={data} />
                )}
            {data?.restaurant_section?.react_restaurant_section_status === 1 ? (
                <LinkSection
                    restaurant_section={
                        landingPageData?.restaurant_section
                    }
                />
            ) : null}

            {data?.testimonials?.testimonial_section_status === '1' ? (
                <Testimonial testimonial_data={data?.testimonials?.testimonial_data} />
            ) : null}

            {data?.faq_section?.faq_section_status === '1' ? (
                <LandingFaQ faq_data={data?.faq_section} />
            ) : null}


            <CookiesConsent text={global?.cookies_text} />
        </>
    )
}

export default LandingPage
