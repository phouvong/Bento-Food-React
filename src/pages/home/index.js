import { NoSsr } from '@mui/material'
import Homes from '../../components/home/Homes'
import Meta from '../../components/Meta'
import HomeGuard from '../../components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const HomePage = ({ pathName, metaData, landingPageData, configData }) => {

    const metadata = processMetadata(metaData, {
        title: configData?.business_name || 'Home',
        description: '',
        image: configData?.logo_full_url ||
            `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`
    })

    return (
        <>
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <Homes configData={configData} />
            </NoSsr>
        </>
    )
}
HomePage.getLayout = (page) => <HomeGuard>{page}</HomeGuard>

export default HomePage

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'home_page')
}
