import React from 'react';
import { Box, Container } from '@mui/material';
import StackedCardSlider from '../StackedCardSlider';

const StackedCardSliderExample = () => {
    // Example dataset
    const testimonialData = [
        {
            id: 1,
            image: '/images/testimonial-1.jpg',
            name: 'John Doe',
            title: 'Amazing Service',
            description: 'The food quality and delivery service exceeded my expectations. Fast, reliable, and delicious every time!',
            review: 'The food quality and delivery service exceeded my expectations. Fast, reliable, and delicious every time!'
        },
        {
            id: 2,
            image: '/images/testimonial-2.jpg',
            name: 'Jane Smith',
            title: 'Great Experience',
            description: 'Outstanding customer service and the food arrived hot and fresh. Will definitely order again!',
            review: 'Outstanding customer service and the food arrived hot and fresh. Will definitely order again!'
        },
        {
            id: 3,
            image: '/images/testimonial-3.jpg',
            name: 'Mike Johnson',
            title: 'Outstanding Quality',
            description: 'Fresh ingredients, perfect packaging, and timely delivery. This is my go-to food delivery service!',
            review: 'Fresh ingredients, perfect packaging, and timely delivery. This is my go-to food delivery service!'
        },
        {
            id: 4,
            image: '/images/testimonial-4.jpg',
            name: 'Sarah Wilson',
            title: 'Delicious Food',
            description: 'Every dish was perfectly prepared and delivered hot. The variety and quality are unmatched!',
            review: 'Every dish was perfectly prepared and delivered hot. The variety and quality are unmatched!'
        },
        {
            id: 5,
            image: '/images/testimonial-5.jpg',
            name: 'David Brown',
            title: 'Perfect Service',
            description: 'Professional service, quality food, and reasonable prices. Highly satisfied with every order!',
            review: 'Professional service, quality food, and reasonable prices. Highly satisfied with every order!'
        }
    ];

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 8 }}>
                {/* Basic Usage */}
                <StackedCardSlider 
                    data={testimonialData}
                    autoplay={true}
                    autoplaySpeed={4000}
                    infinite={true}
                />
                
                {/* Usage without data (will use default data) */}
                {/* <StackedCardSlider /> */}
                
                {/* Usage with custom settings */}
                {/* 
                <StackedCardSlider 
                    data={testimonialData}
                    autoplay={false}
                    infinite={false}
                />
                */}
            </Box>
        </Container>
    );
};

export default StackedCardSliderExample;