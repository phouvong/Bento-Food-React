import React from 'react'
import dynamic from 'next/dynamic'
import { Container, CssBaseline } from '@mui/material'
import { getServerSideProps } from '../index'
const Meta = dynamic(() => import('../../components/Meta'))
const Privacypolicy = dynamic(() =>
    import('../../components/privacy-policy/Privacypolicy')
)

const index = ({ configData }) => {
    return (
        <div className="div">
            <Meta title={`Privacy Policy - ${configData?.business_name}`} />
            <CssBaseline />
            <Container
                maxWidth="lg"
                sx={{ mb: { xs: '72px', md: '0' } }}
                paddingTop="1rem"
            >
                <Privacypolicy configData={configData} />
            </Container>
        </div>
    )
}

export default index
export { getServerSideProps }
