import React, { useState } from 'react'
import { NoSsr } from '@mui/material'
import CuisinesDetailsPage from '../../../components/cuisines-page/CuisinesDetailsPage'
import { useRouter } from 'next/router'
import { useGetCuisinesDetails } from '@/hooks/react-query/cuisines/useGetCuisinesDetails'
import Meta from '../../../components/Meta'
import HomeGuard from '../../../components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const page_limit = 30

const Index = ({ configData, landingPageData, pathName, metaData }) => {
    const [offset, setOffset] = useState(1)
    const [filterByData, setFilterByData] = useState({})
    const router = useRouter()
    const { id } = router.query
    const { data, isLoading } = useGetCuisinesDetails({
        id,
        page_limit,
        offset,
        filterByData,
    })

    const metadata = processMetadata(metaData, {
        title: `${configData?.business_name}`,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`
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
                <HomeGuard>
                    <CuisinesDetailsPage
                        data={data}
                        isLoading={isLoading}
                        offset={offset}
                        setOffset={setOffset}
                        page_limit={page_limit}
                        setFilterByData={setFilterByData}
                    />
                </HomeGuard>
            </NoSsr>
        </>
    )
}

export default Index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'cuisine_list')
}
