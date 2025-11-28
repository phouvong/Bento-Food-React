import React, { useEffect, useState } from 'react'
import { NoSsr } from '@mui/material'
import Meta from '../../../components/Meta.js'
import CategoryDetailsPage from '../../../components/category/CategoryDetailsPage'
import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { CategoryApi } from "@/hooks/react-query/config/categoryApi"
import {
    CustomStackFullWidth,
} from "@/styled-components/CustomStyles.style"
import CustomContainer from '../../../components/container'
import HomeGuard from "../../../components/home-guard/HomeGuard"
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const index = ({ metaData, pathName, configData, landingPageData }) => {
    const [type, setType] = useState('all')
    const [offset, setOffset] = useState(1)
    const [page_limit, setPageLimit] = useState(10)
    const [filterByData, setFilterByData] = useState({})
    const [priceAndRating, setPriceAndRating] = useState({
        price: [],
        rating: 0
    })

    const router = useRouter()
    const { id, name } = router.query
    const [category_id, setCategoryId] = useState(id)
    const { isLoading, data, isError, error, refetch } = useQuery(
        [`category-details`, category_id, offset, page_limit, type, filterByData, priceAndRating],
        () => CategoryApi.categoriesDetails(category_id, type, offset, page_limit, filterByData, priceAndRating)
    )
    const { data: resData } = useQuery(
        [`category-detailsRes`, category_id, offset, page_limit, type, filterByData, priceAndRating],
        () =>
            CategoryApi.categoriesDetailsForRes(
                category_id,
                type,
                offset,
                page_limit, filterByData, priceAndRating
            )
    )
    useEffect(() => {
        type && setOffset(1)
    }, [type])

    useEffect(() => {
        setPriceAndRating({ ...priceAndRating, rating: 0 })
    }, [id]);

    const tempMetadata = processMetadata(metaData, {
        title: name,
        description: '',
        image: `${landingPageData?.banner_section_full?.banner_section_img_full}`
    })


    console.log({ metaData });


    return (
        <>
            <Meta
                title={tempMetadata.title}
                description={tempMetadata.description}
                ogImage={tempMetadata.image}
                pathName={pathName}
                robotsMeta={tempMetadata.robotsMeta}
            />
            <NoSsr>
                <HomeGuard>
                    <CustomContainer>
                        <CustomStackFullWidth
                            sx={{ paddingBottom: '1rem', paddingTop: { xs: "2rem", md: "4.5rem" } }}
                        >
                            <CategoryDetailsPage
                                id={id}
                                data={data}
                                category_id={category_id}
                                setCategoryId={setCategoryId}
                                resData={resData}
                                offset={offset}
                                type={type}
                                setType={setType}
                                page_limit={page_limit}
                                setOffset={setOffset}
                                name={name}
                                filterByData={filterByData}
                                setFilterByData={setFilterByData}
                                priceAndRating={priceAndRating}
                                setPriceAndRating={setPriceAndRating}
                                isLoading={isLoading}

                            />
                        </CustomStackFullWidth>
                    </CustomContainer>
                </HomeGuard>
            </NoSsr>
        </>
    )
}

export default index

export const getServerSideProps = async (context) => {
    const { id } = context.params
    return await getCommonServerSideProps(context, 'category_list', id)
}
