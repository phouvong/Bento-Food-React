import React from 'react'
import { NoSsr } from '@mui/material'
import Meta from '../../components/Meta'
import { t } from 'i18next'
import AllCuisines from '../../components/cuisines-page/AllCuisines'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const Index = ({ configData, landingPageData, pathName, metaData }) => {
    const metadata = processMetadata(metaData, {
        title: `${t('Categories')} on ${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`
    })

    return (
        <>
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <AllCuisines />
            </NoSsr>
        </>
    )
}

export default Index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'cuisine_list')
}
