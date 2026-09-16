import { NoSsr } from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomContainer from '@/components/container'
import HomeGuard from '@/components/home-guard/HomeGuard'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'
import BogoListPage from '@/components/bogo-page/BogoListPage'
import Meta from '@/components/Meta'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const BogoList = ({ configData, pathName, metaData }) => {
    const { t } = useTranslation()

    const metadata = processMetadata(metaData, {
        title: `${t('BOGO Offer')} on ${configData?.business_name}`,
        description: '',
        image: '',
    })

    return (
        <HomeGuard>
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <CustomContainer>
                    <MobilePageHeader title={t('BOGO Offer')} />
                    <BogoListPage />
                </CustomContainer>
            </NoSsr>
        </HomeGuard>
    )
}

export default BogoList

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'bogo_list')
}
