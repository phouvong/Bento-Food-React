import React from 'react'
import { NoSsr } from '@mui/material'
import TypeWiseResturant from '../../../components/type-wise-resturant-page/TypeWiseResturant'
import Meta from '../../../components/Meta'
import { useTranslation } from 'react-i18next'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, landingPageData, pathName, metaData }) => {
    const { t } = useTranslation()
    const metadata = processMetadata(metaData, {
        title: `${t('Recommended Restaurants')} on ${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`,
    })
    return (
        <>
            <div className="div">
                <Meta
                    title={metadata.title}
                    description={metadata.description}
                    ogImage={metadata.image}
                    pathName={pathName}
                    robotsMeta={metadata.robotsMeta}
                />
                <NoSsr>
                    <TypeWiseResturant
                        restaurantType="recommended"
                        title={`${t('Recommended Restaurants')} on ${configData?.business_name}`}
                        description={`${t('Recommended Restaurants')} on ${configData?.business_name}`}
                    />
                </NoSsr>
            </div>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'recommended_foods')
}
