import React from 'react'
import { NoSsr } from '@mui/material'
import { CustomHeader } from '@/api/Headers'
import HeroSectionWithSearch from '@/components/home/hero-section-with-search'
import ProductSearchPage from '@/components/products-page/ProductSearchPage'
import CustomContainer from '@/components/container'
import ScrollToTop from '@/components/scroll-top/ScrollToTop'
import HomeGuard from '@/components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'
import { t } from 'i18next'
import Meta from '@/components/Meta'

const PopularFoodsPage = ({ configData, landingPageData, pathName, metaData  }) => {
     const metadata = processMetadata(metaData, {
            title: `${t('Popular Foods')} on ${configData?.business_name}`,
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
                    <ProductSearchPage configData={configData} page="popular" />
                </CustomContainer>
            </NoSsr>
        </HomeGuard>
    )
}

export default PopularFoodsPage

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'popular_foods')
}

