import { Box, CssBaseline, Grid, Stack } from '@mui/material'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'
import CuisinesCard from '../home/cuisines/CuisinesCard'
import useMediaQuery from '@mui/material/useMediaQuery'
import CustomShimmerCategories from '../CustomShimmer/CustomShimmerCategories'
import CustomContainer from '../container'
import { useSelector } from 'react-redux'
import PageSearchWithTitle from '../category/PageSearchWithTitle'
import { t } from 'i18next'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '../ErrorResponse'
import { useEffect, useState } from 'react'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'

const AllCuisines = () => {
    const matches = useMediaQuery('(max-width:1180px)')
    const { cuisines } = useSelector((state) => state.storedData)
   
    const [searchKey, setSearchKey] = useState('')
    const { data, refetch } = useGetCuisines({ searchKey })
    console.log({data});
    
       
        useEffect(() => {
            const apiRefetch = async () => {
                await refetch()
            }
    
            apiRefetch()
        }, [searchKey])
    
        const handleSearchResult = async (values) => {
            if (values === '') {
                await refetch()
                setSearchKey('')
            } else {
                setSearchKey(values)
            }
        }

    return (
        <>
            <CssBaseline />
            <CustomContainer>

                <Box sx={{ marginTop: { xs: '4rem', sm: '5rem', md: '7rem' } }}>
                    <Box
                        sx={{
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
                        <Box
                            sx={{
                                minWidth: 0,
                                marginTop: { xs: '1.5rem', md: '1.5rem' },
                            }}
                        >
                            <CustomPageTitleSubtitle
                                title={t('Choose Your Favourite Cuisines')}
                                subtitle={t(
                                    'Pick a cuisine to explore — from local favorites to global flavors.'
                                )}
                            />
                            <Grid
                                container
                                spacing={{ xs: 1, md: 2, lg: 2 }}
                                mb="30px"
                            >
                                <Grid item xs={12} sm={12} md={12} justify="center">
                                    <PageSearchWithTitle
                                        handleSearchResult={handleSearchResult}
                                        label={t('Search Cuisines ...')}
                                    />
                                </Grid>
                                {data?.Cuisines?.map((item, index) => (
                                    <Grid
                                        item
                                        md={matches ? 2 : 1.7}
                                        sm={4}
                                        xs={4}
                                        mt=".5rem"
                                    >
                                        <CuisinesCard item={item} key={index} />
                                    </Grid>
                                ))}
                                {!data?.Cuisines && (
                                    <Stack
                                        justifyContent="center"
                                        alignItems="flex-start"
                                        paddingX="20px"
                                    >
                                        <CustomShimmerCategories
                                            noSearchShimmer="true"
                                            itemCount="14"
                                            smItemCount="5"
                                        />
                                    </Stack>
                                )}
                            </Grid>
                        </Box>
                    </Box>
                </Box>

            </CustomContainer>
        </>
    )
}

export default AllCuisines
