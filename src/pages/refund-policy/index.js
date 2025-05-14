import Meta from '../../components/Meta'
import ProtectRefund from './ProtectRefund'
import { Container, CssBaseline } from '@mui/material'
import RefundPolicyPage from '../../components/refund-policy/RefundPolicyPage'
import { getServerSideProps } from '../index'
const index = ({ configData }) => {
    return (
        <>
            <Meta title={`Refund Policy - ${configData?.business_name}`} />
            <CssBaseline />
            <Container
                maxWidth="lg"
                sx={{ mb: { xs: '72px', md: '0' } }}
                paddingTop="1rem"
            >
                <ProtectRefund>
                    <RefundPolicyPage configData={configData} />
                </ProtectRefund>
            </Container>
        </>
    )
}

export default index
export { getServerSideProps }
