import React from 'react'
import { Container, Stack } from '@mui/material'
import { CustomPaperBigCard } from '@/styled-components/CustomStyles.style'
import ReviewLists from './ReviewLists'

const ReviewPage = ({ id }) => {
    return (
        <Container maxWidth="lg" sx={{ mb: { xs: '72px', md: '0' } }}>
            <Stack mt={{ xs: '80px', md: '150px' }} minHeight="500px">
                <CustomPaperBigCard>
                    <ReviewLists id={id} />
                </CustomPaperBigCard>
            </Stack>
        </Container>
    )
}
export default ReviewPage
