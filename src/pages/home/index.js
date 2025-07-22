import Homes from '../../components/home/Homes'
import Meta from '../../components/Meta'
import HomeGuard from '../../components/home-guard/HomeGuard'
import { getServerSideProps } from '../index'

const HomePage = ({ configData, pathName }) => {
    return (
        <>
            <Meta
                title={configData?.business_name}
                ogImage={`${configData?.logo_full_url}`}
                pathName={pathName}
            />
            <Homes configData={configData} />
        </>
    )
}
HomePage.getLayout = (page) => <HomeGuard>{page}</HomeGuard>

export default HomePage
export { getServerSideProps }
