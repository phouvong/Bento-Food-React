import React, { useEffect } from 'react'
import { Grid } from '@mui/material'
import NewFoodCard from '@/components/new-food-card/NewFoodCard'
import { useSelector } from 'react-redux'
import CustomePagination from '../pagination/Pagination'
import useMediaQuery from '@mui/material/useMediaQuery'
export default function ProductList({
    product_list,
    page_limit = 10,
    offset,
    setOffset,
    productType,
}) {
    const { global } = useSelector((state) => state.globalSettings)
    const matchesToMd = useMediaQuery('(max-width:1200px)')

    useEffect(() => {
        if (offset === undefined || typeof window === 'undefined') return
        const url = new URL(window.location.href)
        url.searchParams.set('page', String(offset))
        window.history.replaceState(
            null,
            '',
            `${url.pathname}?${url.searchParams.toString()}`
        )
    }, [offset])

    return (
        <>
            {productType === 'campaigns' ? (
                <>
                    {product_list?.products?.map((product) => {
                        if (
                            product?.variations === null ||
                            product?.variations[0]?.values ||
                            product?.variations?.length === 0
                        ) {
                            return (
                                <Grid
                                    key={product?.id}
                                    item
                                    lg={2}
                                    md={matchesToMd ? 3 : 2}
                                    sm={4}
                                    xs={6}
                                >
                                    <NewFoodCard
                                        product={product}
                                        productImageUrl={
                                            global?.base_urls
                                                ?.campaign_image_url
                                        }
                                        campaign={true}
                                    />
                                </Grid>
                            )
                        }
                    })}
                </>
            ) : (
                <>
                    {product_list?.products?.map((product) => {
                        if (
                            product?.variations === null ||
                            product?.variations[0]?.values ||
                            product?.variations?.length === 0
                        ) {
                            return (
                                <Grid
                                    key={product?.id}
                                    item
                                    md={matchesToMd ? 2.4 : 2}
                                    sm={4}
                                    xs={6}
                                >
                                    <NewFoodCard
                                        product={product}
                                        productImageUrl={
                                            global?.base_urls?.product_image_url
                                        }
                                    />
                                </Grid>
                            )
                        }
                    })}
                </>
            )}

            {product_list?.total_size > page_limit ? (
                <Grid item xs={12} sm={12} md={12} align="center">
                    <CustomePagination
                        total_size={product_list?.total_size}
                        page_limit={page_limit}
                        offset={offset}
                        setOffset={setOffset}
                    />
                </Grid>
            ) : (
                ''
            )}
        </>
    )
}
