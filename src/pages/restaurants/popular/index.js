import React from 'react'
import { NoSsr } from '@mui/material'
import TypeWiseResturant from '../../../components/type-wise-resturant-page/TypeWiseResturant'
import { landingPageApi } from '@/components/landingpage/Api'
import Meta from '../../../components/Meta'
import { useTranslation } from 'react-i18next'
import { CustomHeader } from '@/api/Headers'

const index = ({ configData, landingPageData, pathName }) => {
    const { t } = useTranslation()

    return (
        <>
            <div className="div">
                <Meta
                    title={`${t('Popular Restaurant')} ${t('on')} ${configData?.business_name
                        }`}
                    ogImage={`${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`}
                    pathName={pathName}
                />
                <NoSsr>
                    <TypeWiseResturant
                        restaurantType="popular"
                        title="Popular Restaurant "
                        description="Popular Restaurant Nearby"
                    />
                </NoSsr>
            </div>
        </>
    )
}

export default index

export const getServerSideProps = async ({ params, req, resolvedUrl }) => {
    const domain = req.headers.host
    const pathName = 'https://' + domain + resolvedUrl
    const configRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
        {
            method: 'GET',
            headers: CustomHeader,
        }
    )
    const config = await configRes.json()
    const landingPageData = await landingPageApi.getLandingPageImages()
    return {
        props: {
            configData: config,
            landingPageData: landingPageData.data,
            pathName: pathName,
        },
    }
}
