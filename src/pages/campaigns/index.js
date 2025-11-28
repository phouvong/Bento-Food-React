import React from 'react'
import { NoSsr } from '@mui/material'
import CampaignsPage from '../../components/products-page/CampaignsPage'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from "@/styled-components/CustomStyles.style"
import Meta from '../../components/Meta'
import { useTranslation } from 'react-i18next'
import CustomPageTitle from '../../components/CustomPageTitle'
import CustomContainer from '../../components/container'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, landingPageData, pathName, metaData }) => {
    const { t } = useTranslation()

    const metadata = processMetadata(metaData, {
        title: `${t('Campaigns')} on ${configData?.business_name}`,
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
                <CustomContainer>
                    <CustomStackFullWidth marginBottom="1.6rem">
                        <CustomPaperBigCard
                            padding="1rem"
                            sx={{ marginTop: '1rem', minHeight: '70vh' }}
                        >
                            <CustomStackFullWidth spacing={2}>
                                <CustomPageTitle title={t('Special Food Offers')} />
                                <CampaignsPage />
                            </CustomStackFullWidth>
                        </CustomPaperBigCard>
                    </CustomStackFullWidth>
                </CustomContainer>
            </NoSsr>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'campaign')
}
