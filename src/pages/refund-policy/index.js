import Meta from '../../components/Meta'
import ProtectRefund from './ProtectRefund'
import { Container, CssBaseline, NoSsr } from '@mui/material'
import RefundPolicyPage from '../../components/refund-policy/RefundPolicyPage'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ configData, metaData, landingPageData, pathName }) => {
    const metadata = processMetadata(metaData, {
        title: `Refund Policy - ${configData?.business_name}`,
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
                    <ProtectRefund>
                        <RefundPolicyPage configData={configData} />
                    </ProtectRefund>
                </Container>
            </NoSsr>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'refund_policy_page')
}
