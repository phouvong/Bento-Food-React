import React from 'react'
import { NoSsr } from '@mui/material'
import { useTranslation } from 'react-i18next'
import TypeWiseRestaurant from '@/components/type-wise-restaurant-page/TypeWiseRestaurant'
import Meta from '@/components/Meta'
import HomeGuard from '@/components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

// Static route — takes priority over the /home/[...slug] catch-all, so the
// Filter chip on /home can redirect here without landing in that segment.
const HomeFilterPage = ({ configData, landingPageData, pathName, metaData }) => {
    const { t } = useTranslation()

    const title = `${t('Filter')} ${configData?.business_name ?? ''}`

    const metadata = processMetadata(metaData, {
        title,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`,
    })

    return (
        <div className="div">
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <TypeWiseRestaurant restaurantType="latest" />
            </NoSsr>
        </div>
    )
}

HomeFilterPage.getLayout = (page) => <HomeGuard>{page}</HomeGuard>

export default HomeFilterPage

export const getServerSideProps = async (context) => {
    const baseProps = await getCommonServerSideProps(context, 'filter_foods')
    return { props: { ...baseProps.props } }
}
