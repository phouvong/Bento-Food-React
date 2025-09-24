import CssBaseline from '@mui/material/CssBaseline'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setLandingPageData } from '@/redux/slices/storedData'
import { setGlobalSettings } from '@/redux/slices/global'
import { useSelector } from 'react-redux'

import HeroSection from './HeroSection'
import FunFactSection from './FunFactSection'
import BannerSection from './BannerSection'
import DownloadSection from './DownloadSection'
import AvailableZoneSection from './AvailableZoneSection'
import DiscountBanner from './DiscountBanner'
import CookiesConsent from '../CookiesConsent'
import LinkSection from '@/components/landingpage/link-section/LinkSection'

const LandingPage = ({ global, landingPageData }) => {
    const { landingPageData: storedLandingData } = useSelector((state) => state.storedData);
    const data = landingPageData || storedLandingData

    return (
        <>
            <CssBaseline />

            <HeroSection
                banner_section_title={data?.react_header_title}
                banner_section_subTitle={data?.react_header_sub_title}
                banner_section_image={data?.react_header_image_full_url}
            />
            <FunFactSection
                react_feature={data?.react_services}
            />
            <BannerSection
                banner_section_half={data?.react_promotional_banner}
            />
            {data?.available_zone_status === 1 &&
                data?.available_zone_list?.length > 0 && (
                    <AvailableZoneSection landingPageData={data} />
                )}

            <LinkSection
                self_registration_restaurant={
                    landingPageData?.restaurant_section
                }
                self_registration_deliveryMan={
                    landingPageData?.delivery_section
                }
            />

            {data?.download_app_section
                ?.react_download_apps_banner_image && (
                <DiscountBanner
                    discount_banner={
                        data?.download_app_section
                            ?.react_download_apps_banner_image_full_url
                    }
                />
            )}

            {(data?.download_app_section?.react_download_apps_play_store
                    ?.react_download_apps_play_store_status === '1' ||
                data?.download_app_section?.react_download_apps_app_store
                    ?.react_download_apps_link_status === '1') && (
                <DownloadSection
                    download_app_data={data?.download_app_section}
                    landing_page_links={data?.landing_page_links}
                />
            )}

            <CookiesConsent text={global?.cookies_text} />
        </>
    )
}

export default LandingPage