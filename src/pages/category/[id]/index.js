import React, { useEffect, useState } from 'react'
import { Box, NoSsr } from '@mui/material'
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
import { useSelector } from 'react-redux'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'
import CustomPageTitleSubtitle from '@/components/CustomPageTitleSubtitle'
import { useTranslation } from 'react-i18next'

const index = ({ metaData, pathName, configData, landingPageData }) => {
    const { t } = useTranslation()
    const [type, setType] = useState('all')
    const [offset, setOffset] = useState(1)
    const [page_limit, setPageLimit] = useState(36)
    const [filterByData, setFilterByData] = useState({})
    const [priceAndRating, setPriceAndRating] = useState({
        price: [],
        rating: 0
    })

    const router = useRouter()
    const { id, name } = router.query
    const [category_id, setCategoryId] = useState(id)
    const { foodOrRestaurant } = useSelector((state) => state.searchFilterStore)
    const { isLoading: isProductsLoading, data } = useQuery(
        [`category-details`, category_id, offset, page_limit, type, filterByData, priceAndRating],
        () =>
            CategoryApi.categoriesDetails(
                category_id,
                type,
                offset,
                page_limit,
                filterByData,
                priceAndRating,
                name
            ),
        {
            enabled: Boolean(category_id) && foodOrRestaurant === 'products',
        }
    )
    const { isLoading: isRestaurantsLoading, data: resData } = useQuery(
        [`category-detailsRes`, category_id, offset, page_limit, type, filterByData, priceAndRating],
        () =>
            CategoryApi.categoriesDetailsForRes(
                category_id,
                type,
                offset,
                page_limit,
                filterByData,
                priceAndRating,
                name
            ),
        {
            enabled: Boolean(category_id) && foodOrRestaurant === 'restaurants',
        }
    )
    const isLoading =
        foodOrRestaurant === 'products'
            ? isProductsLoading
            : isRestaurantsLoading

    useEffect(() => {
        type && setOffset(1)
    }, [type])

    useEffect(() => {
        setPageLimit(foodOrRestaurant === 'products' ? 36 : 20)
        setOffset(1)
    }, [foodOrRestaurant])

    useEffect(() => {
        setPriceAndRating({ ...priceAndRating, rating: 0 })
    }, [id]);

    const tempMetadata = processMetadata(metaData, {
        title: name,
        description: '',
        image: `${landingPageData?.banner_section_full?.banner_section_img_full}`
    })
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
                        <Box
                            sx={{
                                marginTop: { xs: '5rem', md: '7rem' },
                                paddingBottom: '1rem',
                                //paddingTop: { xs: '0rem', md: '5.5rem' },
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
                            <CustomStackFullWidth sx={{ minWidth: 0,marginTop:{xs:"1.5rem",md:"1.5rem"}      }}>
                                <CustomPageTitleSubtitle
                                    title={name || t('Category')}
                                    subtitle={t(
                                        'Browse foods and restaurants in this category — refine with filters to find your perfect match.'
                                    )}
                                />
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
                        </Box>
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
