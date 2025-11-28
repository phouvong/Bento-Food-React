import React, { useEffect, useState } from 'react'
import { Stack, NoSsr } from '@mui/material'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CuisinesDetailsPage from '../../../components/cuisines-page/CuisinesDetailsPage'
import { useRouter } from 'next/router'
import { useGetCuisinesDetails } from '@/hooks/react-query/cuisines/useGetCuisinesDetails'
import Meta from '../../../components/Meta'
import CustomContainer from '../../../components/container'
import HomeGuard from '../../../components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const Index = ({ configData, landingPageData, pathName, metaData }) => {
    const [offset, setOffset] = useState(1)
    const [page_limit, setPageLimit] = useState(10)
    const router = useRouter()
    const { id, name } = router.query
    const { data, refetch, isLoading } = useGetCuisinesDetails({
        id,
        page_limit,
        offset,
    })

    useEffect(() => {
        refetch()
    }, [id])

    const metadata = processMetadata(metaData, {
        title: `${name} on ${configData?.business_name}`,
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
                    <CustomContainer>
                        <CustomStackFullWidth>
                            <Stack
                                sx={{
                                    marginTop: {
                                        xs: '1.5rem',
                                        sm: '2rem',
                                        md: '5rem',
                                    },
                                    marginBottom: '1rem',
                                }}
                            >
                                <CuisinesDetailsPage
                                    data={data}
                                    isLoading={isLoading}
                                />
                            </Stack>
                        </CustomStackFullWidth>
                    </CustomContainer>
                </HomeGuard>
            </NoSsr>
        </>
    )
}

export default Index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'cuisine_list')
}
