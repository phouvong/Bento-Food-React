import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import CssBaseline from '@mui/material/CssBaseline'

import { getServerSideProps } from '../index'

// import useScrollToTop from '../../src/api-manage/hooks/custom-hooks/useScrollToTop'
import StoreRegistration from '@/components/store-resgistration'
import Meta from '@/components/Meta'
import CustomContainer from '@/components/container'

const Index = ({ configData, landingPageData }) => {
    const { t } = useTranslation()
    // useScrollToTop()
    return (
        <>
            <CssBaseline />
            <Meta title={`Store registration - ${configData?.business_name}`} />
            <StoreRegistration configData={configData} />
        </>
    )
}

export default Index
export { getServerSideProps }
