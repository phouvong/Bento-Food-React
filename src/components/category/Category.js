import { CssBaseline, Box } from '@mui/material'
import React, { useState } from 'react'
import CategoryList from './CategoryList'
import CustomContainer from '../container'
import PageSearchWithTitle from './PageSearchWithTitle'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '../ErrorResponse'
import { t } from 'i18next'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'

const Category = () => {
    const matches = useMediaQuery('(max-width:1180px)')
    const [searchKey, setSearchKey] = useState('')

    const { isLoading, data } = useQuery(
        ['category', searchKey],
        () => CategoryApi.categories(searchKey),
        {
            onError: onErrorResponse,
        }
    )

    const handleSearchResult = (values) => {
        if (values === '') {
            setSearchKey('')
        } else {
            setSearchKey(values)
        }
    }
    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <Box
                    sx={{
                        marginTop: { xs: '4rem', sm: '5rem', md: '7rem' },
                        marginBottom: { xs: '1rem', sm: '1.5rem', md: '2rem' },
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
                            title={t('Choose Your Favourite Category')}
                            subtitle={t(
                                'Browse all categories — pick one to explore foods and restaurants that match.'
                            )}
                        />
                        <PageSearchWithTitle
                            handleSearchResult={handleSearchResult}
                            label={t('Search categories ...')}
                        />
                        <CategoryList
                            data={data}
                            isLoading={isLoading}
                            matches={matches}
                        />
                    </Box>
                </Box>
            </CustomContainer>
        </>
    )
}

export default Category
