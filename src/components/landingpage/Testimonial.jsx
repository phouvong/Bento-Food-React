
import React, { useState } from "react";
import { Box, Typography, Button, Avatar, useMediaQuery } from '@mui/material'
import { motion } from "framer-motion";
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import { useTheme } from '@mui/styles'
import CustomNextImage from '@/components/CustomNextImage'



export default function CustomerSlider({ testimonial_data }) {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

    // Safety check for testimonial_data
    if (!testimonial_data || testimonial_data.length === 0) {
        return null;
    }

    const total = testimonial_data.length;
    const [activeIndex, setActiveIndex] = useState(Math.min(2, total - 1)); // Ensure activeIndex is within bounds

    const nextSlide = () => setActiveIndex((prev) => (prev + 1) % total);
    const prevSlide = () => setActiveIndex((prev) => (prev - 1 + total) % total);

    // Get 5 visible slides around the active index
    const getVisibleSlides = () => {
        const visibleCount = 5;
        const slides = [];
        const halfVisible = Math.floor(visibleCount / 2);

        for (let i = -halfVisible; i <= halfVisible; i++) {
            const index = (activeIndex + i + total) % total;
            slides.push({
                index,
                position: i,
                data: testimonial_data[index]
            });
        }
        return slides;
    };

    const getPosition = (position) => {
        // Position is relative to center (-2, -1, 0, 1, 2)
        const horizontalSpacing = isSmall ? 180 : 220;
        const x = position * horizontalSpacing; // horizontal spread
        const y = Math.abs(position) * 80; // arc curve
        const rotate = position * 12; // rotation based on position
        const zIndex = 10 - Math.abs(position);

        return { x, y, rotate, zIndex };
    };

    return (
        <Box sx={{ textAlign: "center", pt: {xs:"30px",md:"70px"}, overflow: "hidden" }}>
            <Typography
                fontSize={{ xs: '1.5rem', md: '30px' }}
                fontWeight="700"
                color={theme.palette.neutral[1000]}
                textAlign="center"
                component="h2"
                mb={1}
            >
                Happy Customers
            </Typography>

            {/* Image Slider - 5 slides in circular layout */}
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    height: 330,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {getVisibleSlides().map(({ index, position, data }) => {
                    const { x, y, rotate, zIndex } = getPosition(position);
                    const isActive = position === 0;

                    // Size based on position from center
                    let width = 130;
                    let height = 150;

                    if (position === 0) {
                        width = 200;
                        height = 230;
                    } else if (Math.abs(position) === 1) {
                        width = 155;
                        height = 180;
                    } else if (Math.abs(position) === 2) {
                        width = 130;
                        height = 150;
                    }

                    return (
                        <motion.div
                            key={index}
                            animate={{ x, y, rotate, zIndex }}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                            style={{
                                position: "absolute",
                                cursor: "pointer",
                            }}
                            onClick={() => setActiveIndex(index)}
                        >
                            <CustomNextImage
                                src={data?.image_full_url}
                                alt={data?.name || 'Customer'}
                                style={{
                                    willChange: "transform, width, height",
                                    borderRadius: "20px",
                                    transform: "perspective(500px) rotateX(-10deg)",
                                    transition: "all 0.3s ease",
                                }}
                                height={height}
                                width={width}

                            />
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
                }}
            >
                {testimonial_data[activeIndex] && (
                    <motion.div
                        key={testimonial_data[activeIndex]?.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Typography color={theme.palette.neutral[1000]} variant="h6" fontWeight={700} fontSize="20px" mb={2}>
                            {testimonial_data[activeIndex]?.name || 'Anonymous'}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ px: 2, lineHeight: 1.7 }}
                        >
                            {testimonial_data[activeIndex]?.review || 'No review available'}
                        </Typography>
                    </motion.div>
                )}
            </Box>

            {/* Controls */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 2 }}>
                <Button
                    onClick={prevSlide}
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        minWidth: 0,
                        backgroundColor: theme.palette.neutral[200],
                        color: theme.palette.text.main,
                        "&:hover": { backgroundColor: theme.palette.primary.main, color: "#fff" },
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
                        backgroundColor: theme.palette.neutral[200],
                        color: theme.palette.text.main,
                        "&:hover": { backgroundColor: theme.palette.primary.main, color: "#fff" },
                    }}
                >
                    <EastIcon sx={{ fontSize: 16 }} />
                </Button>
            </Box>
        </Box>
    );
}