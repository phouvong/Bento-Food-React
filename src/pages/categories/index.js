import React from 'react'
import { NoSsr } from '@mui/material'
import Category from '../../components/category/Category'
import Meta from '../../components/Meta'
import { useTranslation } from 'react-i18next'
import HomeGuard from '../../components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, landingPageData, pathName, metaData }) => {
    const { t } = useTranslation()

    const metadata = processMetadata(metaData, {
        title: `${t('Categories')} on ${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`
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
                <HomeGuard>
                    <Category />
                </HomeGuard>
            </NoSsr>
        </div>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'category_list')
}
