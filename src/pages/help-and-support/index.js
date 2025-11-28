import React from 'react'
import Meta from '../../components/Meta'
import { useSelector } from 'react-redux'
import { Container, CssBaseline, NoSsr } from '@mui/material'
import HelpPage from '../../components/help-page/HelpPage'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'
const index = ({ configData, metaData, landingPageData, pathName }) => {
    const metadata = processMetadata(metaData, {
        title: `Contact us - ${configData?.business_name}`,
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
            <CssBaseline />
            <NoSsr>
                <Container maxWidth="lg" sx={{ mb: { xs: '72px', md: '0' } }}>
                    <HelpPage configData={configData} />
                </Container>
            </NoSsr>
        </>
    )
}

export default index
export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'contact_us_page')
}
