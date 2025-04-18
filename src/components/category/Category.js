import { CssBaseline, Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CategoryList from './CategoryList'
import CustomContainer from '../container'
import PageSearchWithTitle from './PageSearchWithTitle'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '../ErrorResponse'
import { t } from 'i18next'

const Category = () => {
    const matches = useMediaQuery('(max-width:1180px)')
    const [searchKey, setSearchKey] = useState('')

    const { isLoading, data, refetch } = useQuery(
        ['category'],
        () => CategoryApi.categories(searchKey),
        {
            onError: onErrorResponse,
        }
    )

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
                <Box
                    sx={{
                        marginTop: { xs: '4rem', sm: '5rem', md: '8.5rem' },
                        marginBottom: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                    }}
                >
                    <PageSearchWithTitle
                        title="Choose Your Favourite Category"
                        handleSearchResult={handleSearchResult}
                        label={t('Search categories ...')}
                    />
                    <CategoryList
                        data={data}
                        isLoading={isLoading}
                        matches={matches}
                    />
                </Box>
            </CustomContainer>
        </>
    )
}

export default Category
