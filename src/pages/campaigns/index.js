import React from 'react'
import { Box, NoSsr } from '@mui/material'
import CampaignsPage from '../../components/products-page/CampaignsPage'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from "@/styled-components/CustomStyles.style"
import Meta from '../../components/Meta'
import { useTranslation } from 'react-i18next'
import CustomPageTitleSubtitle from '../../components/CustomPageTitleSubtitle'
import CustomContainer from '../../components/container'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'
import { Stack } from '@mui/system'

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
                    <CustomStackFullWidth
                        marginBottom="1.6rem"
                        sx={{
                            marginTop: {
                                xs: '4rem',
                                sm: '5rem',
                                md: '7rem',
                            },
                        }}
                    >
                        <Box
                            sx={{
                                display: { xs: 'block', md: 'grid' },
                                gridTemplateColumns: { md: '260px 1fr' },
                                columnGap: { md: '28px' },
                            }}
                        >
                            <Box
                                sx={{
                                    display: { xs: 'none', md: 'block' },
                                    position: 'relative',
                                }}
                            >
                                <HomeSidebar />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Stack
                                    padding="1rem"
                                    sx={{ minHeight: '70vh' }}
                                >
                                    <CustomStackFullWidth spacing={2}>
                                        <CustomPageTitleSubtitle
                                            title={t('Special Food Offers')}
                                            subtitle={t(
                                                'Limited-time deals and seasonal promotions — grab them before they vanish.'
                                            )}
                                        />
                                        <CampaignsPage />
                                    </CustomStackFullWidth>
                                </Stack>
                            </Box>
                        </Box>
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
