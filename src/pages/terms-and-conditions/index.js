import Meta from '../../components/Meta'
import { Container, CssBaseline } from '@mui/material'
import ConditionPage from '../../components/terms-condition/ConditionPage'
import { getServerSideProps } from '../index'

const index = ({ configData }) => {
    return (
        <>
            <Meta
                title={`Terms and conditions - ${configData?.business_name}`}
            />
            <CssBaseline />
            <Container maxWidth="lg" sx={{ mb: { xs: '72px', md: '0' } }}>
                <ConditionPage configData={configData} />
            </Container>
        </>
    )
}

export default index

export { getServerSideProps }
