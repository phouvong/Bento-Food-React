import React from 'react'
import { NoSsr } from '@mui/material'
import Meta from '../../components/Meta'
import { useTranslation } from 'react-i18next'
import CouponsPage from '../../components/coupons-page/CouponsPage'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, landingPageData, pathName, metaData }) => {
    const { t } = useTranslation()

    const metadata = processMetadata(metaData, {
        title: `${t('Coupons')} on ${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`,
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
                <CouponsPage />
            </NoSsr>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'coupon_list')
}
