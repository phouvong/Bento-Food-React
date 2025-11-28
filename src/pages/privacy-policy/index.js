import React from 'react'
import dynamic from 'next/dynamic'
import { Container, CssBaseline, NoSsr } from '@mui/material'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'
import Meta from '../../components/Meta'
const Privacypolicy = dynamic(() =>
    import('../../components/privacy-policy/Privacypolicy')
)

const index = ({ configData, metaData, landingPageData, pathName }) => {
    const metadata = processMetadata(metaData, {
        title: `Privacy Policy - ${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`
    })

    return (
        <div className="div">
            <CssBaseline />
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <Container
                    maxWidth="lg"
                    sx={{ mb: { xs: '72px', md: '0' } }}
                    paddingTop="1rem"
                >
                    <Privacypolicy configData={configData} />
                </Container>
            </NoSsr>
        </div>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'privacy_policy_page')
}
