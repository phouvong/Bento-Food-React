import React from 'react'
import { CssBaseline, Box } from '@mui/material'
import ProductPage from './ProductPage'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import CustomPageTitle from '../CustomPageTitle'
import CustomContainer from '../container'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@emotion/react'

const Products = ({ type, title }) => {
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <CustomStackFullWidth>
                    <CustomPaperBigCard
                        padding={!isSmall ? '1.8rem' : '1rem'}
                        sx={{
                            marginTop: '1rem',
                            minHeight: '70vh',
                            marginBottom: '1rem',
                        }}
                    >
                        <CustomStackFullWidth>
                            <CustomPageTitle title={title} />
                            <Box sx={{ marginTop: '1.2rem' }}>
                                <ProductPage product_type={type} />
                            </Box>
                        </CustomStackFullWidth>
                    </CustomPaperBigCard>
                </CustomStackFullWidth>
            </CustomContainer>
        </>
    )
}

export default Products
