import { Box, CssBaseline, Grid, Stack, useTheme } from '@mui/material'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'
import CuisinesCard from '../home/cuisines/CuisinesCard'
import useMediaQuery from '@mui/material/useMediaQuery'
import CustomShimmerCategories from '../CustomShimmer/CustomShimmerCategories'
import CustomContainer from '../container'
import { useSelector } from 'react-redux'
import CustomSearch from '../custom-search/CustomSearch'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'
import { t } from 'i18next'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '../ErrorResponse'
import { useEffect, useState } from 'react'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'

const AllCuisines = () => {
    const theme = useTheme()
    const matches = useMediaQuery('(max-width:1180px)')
    const { cuisines } = useSelector((state) => state.storedData)
   
    const [searchKey, setSearchKey] = useState('')
    const { data, refetch } = useGetCuisines({ searchKey })

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
                <MobilePageHeader title={t('Cuisines')} />

                <Box sx={{ paddingTop: { xs: '16px', md: '24px' } }}>
                    <Box sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                alignItems: { xs: 'stretch', md: 'center' },
                                gap: { xs: 2, md: 3 },
                                mb: { xs: 1.5, md: 3 },
                            }}
                        >
                            <CustomPageTitleSubtitle
                                title={t('Choose Your Favourite Cuisines')}
                                subtitle={t(
                                    'Pick a cuisine to explore — from local favorites to global flavors.'
                                )}
                                mb={0}
                            />
                            <Box sx={{ width: { xs: '100%', md: '340px' }, flexShrink: 0 }}>
                                <CustomSearch
                                    handleSearchResult={handleSearchResult}
                                    label={t('Search Cuisines ...')}
                                    backgroundColor={theme.palette.background.paper}
                                    borderRadius="12px"
                                />
                            </Box>
                        </Box>
                        <Grid
                            container
                            spacing={{ xs: 1, md: 2, lg: 2 }}
                            mb="30px"
                        >
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

            </CustomContainer>
        </>
    )
}

export default AllCuisines
