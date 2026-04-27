import React from 'react'
import { NoSsr } from '@mui/material'
import ProductSearchPage from '@/components/products-page/ProductSearchPage'
import CustomContainer from '@/components/container'
import HomeGuard from '@/components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'
import { t } from 'i18next'
import Meta from '@/components/Meta'

const MostReviewedFoodsPage = ({ configData, landingPageData, pathName, metaData }) => {
    const metadata = processMetadata(metaData, {
        title: `${t('Most Reviewed Foods')} on ${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`
    })
    return (
        <HomeGuard>
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <CustomContainer>
                    <ProductSearchPage
                        configData={configData}
                        page="most-reviewed"
                    />
                </CustomContainer>
            </NoSsr>
        </HomeGuard>
    )
}

export default MostReviewedFoodsPage

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'most_reviewed_foods')
}
