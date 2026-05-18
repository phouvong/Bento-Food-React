import React, { useEffect } from 'react'
import { Grid, useMediaQuery } from '@mui/material'
import NewStoreCard from '@/components/new-store-card/NewStoreCard'
import CustomePagination from '../pagination/Pagination'
import { useRouter } from 'next/router'

const RestaurantsData = ({
    resData,
    page_limit = 10,
    offset,
    setOffset,
    global,
    restaurantType,
}) => {
    const router = useRouter();
    const matchesToMd = useMediaQuery('(min-width:740px)');
    
    useEffect(() => {
        if (offset !== undefined) {
            const url = `${router.asPath}&page=${offset}`;
            window.history.replaceState(null, "", url);
        }
    }, [offset]);

    return (
        <>
            {resData?.data?.restaurants?.map((res) => (
                <Grid
                    key={res?.id}
                    item
                    lg={3}
                    md={3}
                    sm={6}
                    xs={12}
                >
                    <NewStoreCard
                        restaurant={{
                            ...res,
                            opening_time: res?.current_opening_time,
                            dine_in:
                                restaurantType === 'dine-in' ? 'dine_in' : '',
                        }}
                    />
                </Grid>
            ))}
            {restaurantType !== 'latest' &&
            resData?.data?.restaurants?.length > page_limit ? (
                <Grid item xs={12} sm={12} md={12} align="center">
                    <CustomePagination
                        total_size={resData?.data?.restaurants?.length}
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

RestaurantsData.propTypes = {}

export default RestaurantsData
