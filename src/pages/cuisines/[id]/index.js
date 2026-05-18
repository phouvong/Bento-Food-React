import React, { useState } from 'react'
import { Box, Stack, NoSsr } from '@mui/material'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CuisinesDetailsPage from '../../../components/cuisines-page/CuisinesDetailsPage'
import { useRouter } from 'next/router'
import { useGetCuisinesDetails } from '@/hooks/react-query/cuisines/useGetCuisinesDetails'
import Meta from '../../../components/Meta'
import CustomContainer from '../../../components/container'
import HomeGuard from '../../../components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'

const Index = ({ configData, landingPageData, pathName, metaData }) => {
    const [offset, setOffset] = useState(1)
    const [page_limit, setPageLimit] = useState(36)
    const [filterByData, setFilterByData] = useState({})
    const [priceAndRating, setPriceAndRating] = useState({ price: [], rating: 0 })
    const [filterBy, setFilterBy] = useState([])
    const [searchKey, setSearchKey] = useState('')
    const router = useRouter()
    const { id } = router.query
    const { data, isLoading } = useGetCuisinesDetails({
        id,
        page_limit,
        offset,
        filterByData,
        priceAndRating,
        filterBy,
        searchKey,
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
                    <CustomContainer>
                        <Box
                            sx={{
                                marginTop: {
                                    xs: '4rem',
                                    sm: '5rem',
                                    md: '7rem',
                                },
                                marginBottom: '1rem',
                                display: { xs: 'block', md: 'grid' },
                                gridTemplateColumns: { md: '260px 1fr' },
                                columnGap: { md: '28px' },
                            }}
                        >
                            <Box
                                sx={{
                                    display: { xs: 'none', md: 'block' },
                                    position: 'relative',
                                }}
                            >
                                <HomeSidebar />
                            </Box>
                            <CustomStackFullWidth sx={{ minWidth: 0,marginTop:{xs:"1.5rem",md:".5rem"}          }}>
                                <CuisinesDetailsPage
                                    data={data}
                                    isLoading={isLoading}
                                    offset={offset}
                                    setOffset={setOffset}
                                    page_limit={page_limit}
                                    setFilterByData={setFilterByData}
                                    setPriceAndRating={setPriceAndRating}
                                    setFilterBy={setFilterBy}
                                    setSearchKey={setSearchKey}
                                />
                            </CustomStackFullWidth>
                        </Box>
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
