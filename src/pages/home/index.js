import React, { useEffect } from 'react'
import Homes from '../../components/home/Homes'
import Meta from '../../components/Meta'
import HomeGuard from '../../components/home-guard/HomeGuard'
import { getServerSideProps } from '../index'
import { useRouter } from 'next/router'
const HomePage = ({ configData, landingPageData, pathName }) => {
    const router = useRouter()
    // useEffect(() => {
    //
    //     if (configData) {
    //         if (configData.maintenance_mode) {
    //             router.push('/maintenance');
    //             //return;
    //         }
    //         // dispatch(setGlobalSettings(configData));
    //     }
    // }, [configData, router]);
    return (
        <>
            <Meta
                title={configData?.business_name}
                ogImage={`${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`}
                pathName={pathName}
            />
            <Homes configData={configData} />
        </>
    )
}
HomePage.getLayout = (page) => <HomeGuard>{page}</HomeGuard>

export default HomePage
export { getServerSideProps }
