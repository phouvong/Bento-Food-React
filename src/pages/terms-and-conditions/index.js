import Meta from '../../components/Meta'
import { Container, CssBaseline, NoSsr } from '@mui/material'
import ConditionPage from '../../components/terms-condition/ConditionPage'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, metaData, landingPageData, pathName }) => {
    const metadata = processMetadata(metaData, {
        title: `Terms and conditions - ${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`
    })

    return (
        <>
            <CssBaseline />
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <Container maxWidth="lg" sx={{ mb: { xs: '72px', md: '0' } }}>
                    <ConditionPage configData={configData} />
                </Container>
            </NoSsr>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'terms_and_conditions_page')
}
