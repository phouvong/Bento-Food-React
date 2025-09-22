import { useTranslation } from 'react-i18next'
import CssBaseline from '@mui/material/CssBaseline'
import { getServerSideProps } from '../index'
import StoreRegistration from '@/components/store-resgistration'
import Meta from '@/components/Meta'

const Index = ({ configData, landingPageData }) => {
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
