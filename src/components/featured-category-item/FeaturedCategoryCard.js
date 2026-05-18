import { Grid, Typography, Box } from '@mui/material'
import React, { useRef } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CustomImageContainer from '../CustomImageContainer'
import { FeatureImageBox } from './FeaturedCategory.style'
import Router, { useRouter } from 'next/router'
import CustomNextImage from '@/components/CustomNextImage'
import Image from 'next/image'

const DRAG_THRESHOLD = 6

const FeaturedCategoryCard = ({
    categoryImage,
    name,
    id,
    categoryIsSticky,
    slug,
}) => {
    const theme = useTheme()
    const router = useRouter()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const image = categoryImage

    const pointerStart = useRef(null)
    const draggedRef = useRef(false)

    const handlePointerDown = (e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY }
        draggedRef.current = false
    }

    const handlePointerMove = (e) => {
        if (!pointerStart.current) return
        const dx = Math.abs(e.clientX - pointerStart.current.x)
        const dy = Math.abs(e.clientY - pointerStart.current.y)
        if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
            draggedRef.current = true
        }
    }

    const handleClick = (e) => {
        if (draggedRef.current) {
            e.preventDefault()
            e.stopPropagation()
            draggedRef.current = false
            return
        }
        Router.push(
            {
                pathname: `/category/${slug || id}`,
                query: { name },
            },
            undefined,
            { shallow: true }
        )
    }
    const getSize = () => {
        if (isSmall) {
            return image ? 52 : 28
        }
        return image ? 80 : 52
    }

    const size = getSize()
    return (
        <Grid
            item
            sx={{
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover .cat-ring': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 24px rgba(15,23,42,.12)',
                },
                '&:hover .cat-label': {
                    color: (theme) => theme.palette.primary.main,
                    fontWeight: 600,
                },
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onClickCapture={handleClick}
        >
            <FeatureImageBox
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 0.75, md: 1 }}
                sx={{ borderRadius: '50%' }}
            >
                <Box
                    className="cat-ring"
                    sx={{
                        height: { xs: '60px', md: '86px' },
                        width: { xs: '60px', md: '86px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: (theme) => `3px solid ${theme.palette.neutral[100]}`,
                        borderColor: (theme) => theme.palette.neutral[100],
                        backgroundColor: '#FFF4EC',
                        borderRadius: '50%',
                        padding: 0,
                        overflow: 'hidden',
                        transition:
                            'border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
                        willChange: 'transform, box-shadow',
                        boxShadow: '0 8px 18px rgba(15,23,42,.08)',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[100],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <CustomNextImage
                            src={image}
                            alt={name}
                            width={size}
                            height={size}
                            borderRadius="50%"
                            objectFit={image ? 'cover' : 'contain'}
                        />
                    </Box>
                </Box>
                <Typography
                    className="cat-label"
                    sx={{
                        color: (theme) => theme.palette.neutral[1000],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                        transition: 'color 0.2s ease, font-weight 0.2s ease',
                        textTransform: 'capitalize',
                        textAlign: 'center',
                        maxWidth: { xs: '70px', md: '100px' },
                    }}
                    fontSize={{ xs: '12px', sm: '12.5px', md: '12.5px' }}
                    fontWeight={700}
                    component="h3"
                >
                    {name}
                </Typography>
            </FeatureImageBox>
        </Grid>
    )
}

export default FeaturedCategoryCard
