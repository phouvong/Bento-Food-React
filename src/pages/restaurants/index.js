import React from 'react'
import { NoSsr } from '@mui/material'
import Restaurant from '../../components/restaurant-page/Restaurant'
import Meta from '../../components/Meta'
import PushNotificationLayout from '../../components/PushNotificationLayout'
import { useTranslation } from 'react-i18next'
import HomeGuard from "../../components/home-guard/HomeGuard"
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, landingPageData, pathName, metaData }) => {
    const { t } = useTranslation()

    const metadata = processMetadata(metaData, {
        title: `${t('Restaurants')} ${t('on')} ${configData?.business_name}`,
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
                    <PushNotificationLayout>
                        <Restaurant />
                    </PushNotificationLayout>
                </HomeGuard>
            </NoSsr>
        </div>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'vendor_list')
}
