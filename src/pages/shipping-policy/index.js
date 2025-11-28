import Meta from '../../components/Meta'
import ProtectShipping from './ProtectShipping'
import { Container, CssBaseline, NoSsr } from '@mui/material'
import ShippingPolicyPage from '../../components/shipping-policy/ShippingPolicyPage'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, metaData, landingPageData, pathName }) => {
    const metadata = processMetadata(metaData, {
        title: `Shipping Policy - ${configData?.business_name}`,
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
                <Container
                    maxWidth="lg"
                    sx={{ mb: { xs: '72px', md: '0' } }}
                    paddingTop="1rem"
                >
                    <ProtectShipping>
                        <ShippingPolicyPage configData={configData} />
                    </ProtectShipping>
                </Container>
            </NoSsr>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'shipping_policy_page')
}
