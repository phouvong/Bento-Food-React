import Meta from '../../components/Meta'
import React from 'react'
import ProtectCancellation from './ProtectCancellation'
import { Container, CssBaseline } from '@mui/material'
import CancellationPolicyPage from '../../components/cancellation-policy/CancellationPolicyPage'
import { getServerSideProps } from '../index'

const index = ({ configData }) => {
    return (
        <>
            <CssBaseline />
            <Meta
                title={`Cancellation policy - ${configData?.business_name}`}
            />
            <Container
                maxWidth="lg"
                sx={{ mb: { xs: '72px', md: '0' } }}
                paddingTop="1rem"
            >
                <ProtectCancellation>
                    <CancellationPolicyPage configData={configData} />
                </ProtectCancellation>
            </Container>
        </>
    )
}

export default index
export { getServerSideProps }
