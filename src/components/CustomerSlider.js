import React, { useState } from "react";
import { Box, Typography, Button, useMediaQuery } from '@mui/material'
import { motion } from "framer-motion";
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { useTheme } from '@mui/material/styles' // Fixed import
import CustomNextImage from '@/components/CustomNextImage'

export default function CustomerSlider({ testimonial_data }) {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const [activeIndex, setActiveIndex] = useState(2);
    const total = testimonial_data?.length || 0; // Added safety check
    


    // Safety check for empty data
    if (!testimonial_data || testimonial_data.length === 0) {
        return (
            <Box sx={{ textAlign: "center", pt: 10 }}>
                <Typography variant="h6">No testimonials available</Typography>
            </Box>
        );
    }

    const nextSlide = () => setActiveIndex((prev) => (prev + 1) % total);
    const prevSlide = () => setActiveIndex((prev) => (prev - 1 + total) % total);

    const getPosition = (index) => {
        const diff = ((index - activeIndex + total) % total);
        const offset = diff > total / 2 ? diff - total : diff;

        // Improved positioning logic
        let x, y;
        if (Math.abs(offset) === 0) {
            x = 0;
            y = 0;
        } else if (Math.abs(offset) === 1) {
            x = isSmall ? offset * 160 : offset * 200;
            y = 30;
        } else if (Math.abs(offset) === 2) {
            x = isSmall ? offset * 140 : offset * 180;
            y = 60;
        } else {
            x = isSmall ? offset * 120 : offset * 160;
            y = 80;
        }

        const rotate = offset * 10; // Reduced rotation
        const zIndex = 10 - Math.abs(offset);

        return { x, y, rotate, zIndex };
    };

    return (
        <Box sx={{ textAlign: "center", pt: 10, overflow: "hidden" }}>
            <Typography
                fontSize={{ xs: '1.5rem', md: '30px' }}
                fontWeight="700"
                color={theme.palette.neutral?.[1000] || theme.palette.text.primary}
                textAlign="center"
                component="h2"
                mb={1}
            >
                Happy Customers
            </Typography>

            {/* Image Slider */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    height: { xs: 280, md: 330 }, // Responsive height
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                }}
            >
                {testimonial_data.map((customer, index) => {
                    const { x, y, rotate, zIndex } = getPosition(index);
                    const isActive = index === activeIndex;

                    const diff = Math.abs(index - activeIndex);
                    let width = 100;
                    let height = 120;

                    if (diff === 0) {
                        width = isSmall ? 150 : 200;
                        height = isSmall ? 180 : 230;
                    } else if (diff === 1) {
                        width = isSmall ? 120 : 155;
                        height = isSmall ? 140 : 180;
                    } else if (diff === 2) {
                        width = isSmall ? 100 : 130;
                        height = isSmall ? 120 : 150;
                    }

                    return (
                        <motion.div
                            key={`${customer?.id || index}-${index}`} // Better key
                            animate={{ x, y, rotate, zIndex }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 100, 
                                damping: 25,
                                duration: 0.6 
                            }}
                            style={{
                                position: "absolute",
                                cursor: "pointer",
                                willChange: "transform",
                            }}
                            onClick={() => setActiveIndex(index)}
                        >
                            <Box
                                sx={{
                                    width: width,
                                    height: height,
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    boxShadow: isActive 
                                        ? "0 10px 30px rgba(0,0,0,0.3)" 
                                        : "0 5px 15px rgba(0,0,0,0.2)",
                                    transform: isActive 
                                        ? "perspective(500px) rotateX(-5deg) scale(1.05)" 
                                        : "perspective(500px) rotateX(-10deg)",
                                    transition: "all 0.3s ease",
                                    border: isActive ? `3px solid ${theme.palette.primary.main}` : 'none',
                                }}
                            >
                                <CustomNextImage
                                    src={customer?.image_full_url || customer?.image || '/placeholder-avatar.png'}
                                    alt={customer?.name || `Customer ${index + 1}`}
                                    width={width}
                                    height={height}
                                    style={{
                                        objectFit: "cover",
                                        width: "100%",
                                        height: "100%",
                                    }}
                                    onError={(e) => {
                                        console.error('Image failed to load:', customer?.image_full_url);
                                        e.target.src = '/placeholder-avatar.png'; // Fallback image
                                    }}
                                />
                            </Box>
                        </motion.div>
                    );
                })}
            </Box>

            {/* Active content */}
            <Box
                sx={{
                    maxWidth: 600,
                    mx: "auto",
                    minHeight: 160,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                }}
            >
                <motion.div
                    key={`content-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ textAlign: 'center' }}
                >
                    <Typography 
                        variant="h6" 
                        fontWeight={700} 
                        fontSize={{ xs: "18px", md: "20px" }}
                        mb={2}
                        color={theme.palette.text.primary}
                    >
                        {testimonial_data[activeIndex]?.name || 'Anonymous'}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ 
                            px: 2, 
                            lineHeight: 1.7,
                            fontSize: { xs: "14px", md: "16px" }
                        }}
                    >
                        {testimonial_data[activeIndex]?.review || 'No review available'}
                    </Typography>
                </motion.div>
            </Box>

            {/* Controls */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
                <Button
                    onClick={prevSlide}
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        minWidth: 0,
                        backgroundColor: theme.palette.neutral?.[200] || theme.palette.grey[200],
                        color: theme.palette.text.primary,
                        "&:hover": { 
                            backgroundColor: theme.palette.primary.main, 
                            color: "#fff",
                            transform: "scale(1.1)"
                        },
                        transition: "all 0.2s ease"
                    }}
                >
                    <WestIcon sx={{ fontSize: 16 }} />
                </Button>
                <Button
                    onClick={nextSlide}
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        minWidth: 0,
                        backgroundColor: theme.palette.neutral?.[200] || theme.palette.grey[200],
                        color: theme.palette.text.primary,
                        "&:hover": { 
                            backgroundColor: theme.palette.primary.main, 
                            color: "#fff",
                            transform: "scale(1.1)"
                        },
                        transition: "all 0.2s ease"
                    }}
                >
                    <EastIcon sx={{ fontSize: 16 }} />
                </Button>
            </Box>

            {/* Dots indicator */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
                {testimonial_data.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: index === activeIndex 
                                ? theme.palette.primary.main 
                                : theme.palette.grey[400],
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            "&:hover": {
                                transform: "scale(1.2)"
                            }
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}