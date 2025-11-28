import React, { useState, useRef } from 'react';
import Slider from 'react-slick';
import { Box, Typography, Card, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import CustomNextImage from '@/components/CustomNextImage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { t } from 'i18next'

const StackedCardSlider = ({
    data = [],
    autoplay = true,
    autoplaySpeed = 3000,
    infinite = true
}) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);

    // Default data if none provided
    const defaultData = [
        {
            id: 1,
            image: '/images/testimonial-1.jpg',
            title: 'Amazing Service',
            name: 'John Doe',
            description: 'The food quality and delivery service exceeded my expectations. Highly recommended!'
        },
        {
            id: 2,
            image: '/images/testimonial-2.jpg',
            title: 'Great Experience',
            name: 'Jane Smith',
            description: 'Fast delivery, hot food, and excellent customer service. Will order again!'
        },
        {
            id: 3,
            image: '/images/testimonial-3.jpg',
            title: 'Outstanding Quality',
            name: 'Mike Johnson',
            description: 'Fresh ingredients, perfect packaging, and timely delivery. 5 stars!'
        },
        {
            id: 4,
            image: '/images/testimonial-4.jpg',
            title: 'Delicious Food',
            name: 'Sarah Wilson',
            description: 'Every dish was perfectly prepared and delivered hot. Amazing experience!'
        },
        {
            id: 5,
            image: '/images/testimonial-5.jpg',
            title: 'Perfect Service',
            name: 'David Brown',
            description: 'Professional service, quality food, and reasonable prices. Highly satisfied!'
        }
    ];

    const slideData = data.length > 0 ? data : defaultData;

    const settings = {
        dots: false,
        infinite: infinite,
        speed: 800,
        slidesToShow: isSmall ? 1 : 3, // Show 1 on mobile, 3 on desktop
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: isSmall ? '20px' : '100px',
        autoplay: autoplay,
        autoplaySpeed: autoplaySpeed,
        pauseOnHover: true,
        swipeToSlide: true,
        touchThreshold: 5,
        swipe: true,
        draggable: true,
        cssEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        beforeChange: (current, next) => {
            setCurrentSlide(next);
        },
    };

    // Get card background colors
    const getCardBackground = (index) => {
        const colors = [
            '#2c3e50', // Dark blue-gray
            '#34495e', // Darker gray
            '#7fb3d3', // Light blue
            '#5dade2', // Blue
            '#85c1e9', // Light blue
        ];
        return colors[index % colors.length];
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '1200px',
                mx: 'auto',
                py: 8,
                px: { xs: 2, md: 4 },
                background: '#ffffff',
                minHeight: '700px',
            }}
        >
            <Typography
                variant="h2"
                component="h2"
                sx={{
                    textAlign: 'center',
                    mb: 6,
                    fontWeight: 600,
                    color: '#666',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    letterSpacing: '-0.01em',
                }}
            >
                {t("Happy Customers")}
            </Typography>

            <Box
                className="stacked-card-slider"
                sx={{
                    position: 'relative',
                    height: isSmall ? 400 : 450,
                    maxWidth: '1200px',
                    mx: 'auto',
                    overflow: 'hidden', // Hide cards sliding in/out
                    perspective: '1500px',
                    transformStyle: 'preserve-3d',
                    '& .slick-slider': {
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                    },
                    '& .slick-list': {
                        overflow: 'visible',
                        padding: '0',
                        height: '100%',
                    },
                    '& .slick-track': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    },
                    '& .slick-slide': {
                        padding: '0',
                        transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                    },
                    '& .slick-dots': {
                        display: 'none !important', // Hide dots
                    },
                    '& .slick-arrow': {
                        display: 'none !important', // Hide default arrows
                    }
                }}
            >
                <Box sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .slick-slider': {
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                    },
                    '& .slick-list': {
                        overflow: 'visible',
                        padding: '0',
                        height: '100%',
                    },
                    '& .slick-track': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    },
                    '& .slick-slide': {
                        padding: '0',
                        transition: 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                    },
                    '& .slick-dots': {
                        bottom: '-60px',
                        '& li button:before': {
                            fontSize: '12px',
                            color: theme.palette.primary.main,
                            opacity: 0.5,
                        },
                        '& li.slick-active button:before': {
                            opacity: 1,
                            color: theme.palette.primary.main,
                            transform: 'scale(1.3)',
                        }
                    },
                    '& .slick-arrow': {
                        zIndex: 25,
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        border: '2px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        '&:before': {
                            fontSize: '18px',
                            color: theme.palette.primary.main,
                        },
                        '&:hover': {
                            background: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            transform: 'scale(1.1)',
                            '&:before': {
                                color: 'white',
                            }
                        }
                    },
                    '& .slick-prev': {
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    },
                    '& .slick-next': {
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }
                }}>
                    {/* Normal Slick Slider */}
                    <Slider ref={sliderRef} {...settings}>
                        {slideData.map((item, index) => {
                            const cardBackground = getCardBackground(index);
                            const isCenter = index === currentSlide;

                            return (
                                <Box key={item.id || index} sx={{ outline: 'none', px: 1 }}>
                                    <Card
                                        sx={{
                                            width: isSmall ? 200 : 240,
                                            height: isSmall ? 260 : 300,
                                            mx: 'auto',
                                            borderRadius: '24px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            transform: isCenter ? 'scale(1.05)' : 'scale(0.95)',
                                            opacity: isCenter ? 1 : 0.8,
                                            boxShadow: isCenter
                                                ? '0 20px 40px rgba(0,0,0,0.15)'
                                                : '0 10px 25px rgba(0,0,0,0.1)',
                                            border: 'none',
                                            background: cardBackground,
                                            '&:hover': {
                                                transform: isCenter ? 'scale(1.08)' : 'scale(0.98)',
                                                opacity: 1,
                                            }
                                        }}
                                        onClick={() => {
                                            if (sliderRef.current) {
                                                sliderRef.current.slickGoTo(index);
                                            }
                                        }}
                                    >
                                        {/* Full Card Image */}
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 3,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '20px',
                                                    overflow: 'hidden',
                                                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                                                }}
                                            >
                                                <CustomNextImage
                                                    src={item?.image_full_url || item?.image || '/images/default-testimonial.jpg'}
                                                    alt={item?.name || item?.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                    width={240}
                                                    height={300}
                                                />
                                            </Box>
                                        </Box>
                                    </Card>
                                </Box>
                            );
                        })}
                    </Slider>
                </Box>

                {/* Center Card Information */}
                <Box
                    sx={{
                        textAlign: 'center',
                        mt: 4,
                        mb: 4,
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {slideData[currentSlide] && (
                        <Box
                            sx={{
                                maxWidth: 600,
                                px: 2,
                            }}
                        >
                            <Typography
                                variant="h4"
                                component="h3"
                                sx={{
                                    fontWeight: 600,
                                    mb: 3,
                                    color: '#2c3e50',
                                    fontSize: { xs: '1.5rem', md: '1.8rem' },
                                }}
                            >
                                {slideData[currentSlide]?.name || slideData[currentSlide]?.title}
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#7f8c8d',
                                    lineHeight: 1.7,
                                    fontSize: { xs: '0.95rem', md: '1rem' },
                                    maxWidth: 500,
                                    mx: 'auto',
                                }}
                            >
                                {slideData[currentSlide]?.review || slideData[currentSlide]?.description}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Custom Navigation */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 3,
                        mt: 6,
                    }}
                >
                    <Box
                        onClick={() => sliderRef.current?.slickPrev()}
                        sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: 1,
                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            '&:hover': {
                                background: '#d0d0d0',
                                transform: 'scale(1.1) translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            }
                        }}
                    >
                        <Box
                            sx={{
                                width: 0,
                                height: 0,
                                borderTop: '8px solid transparent',
                                borderBottom: '8px solid transparent',
                                borderRight: '12px solid #666',
                                ml: '-2px',
                                transition: 'all 0.2s ease',
                            }}
                        />
                    </Box>

                    <Box
                        onClick={() => sliderRef.current?.slickNext()}
                        sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: '#ff6b35',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: 1,
                            transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                            '&:hover': {
                                background: '#e55a2b',
                                transform: 'scale(1.1) translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.5)',
                            },
                            '&:active': {
                                transform: 'scale(0.95)',
                            }
                        }}
                    >
                        <Box
                            sx={{
                                width: 0,
                                height: 0,
                                borderTop: '8px solid transparent',
                                borderBottom: '8px solid transparent',
                                borderLeft: '12px solid white',
                                ml: '2px',
                                transition: 'all 0.2s ease',
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default StackedCardSlider;