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
    type,
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
        if (type === 'cuisine') {
            Router.push(
                { pathname: `/cuisines/${slug || id}` },
                undefined,
                { shallow: true }
            )
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
                width: { xs: '72px', md: '102px' },
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onClickCapture={handleClick}
        >
            <FeatureImageBox
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 1, md: 1.5 }}
                sx={{ borderRadius: '50%' }}
            >
                <Box
                    className="cat-ring"
                    sx={{
                        height: { xs: '56px', md: '86px' },
                        width: { xs: '56px', md: '86px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: (theme) =>
                            `2px solid ${theme.palette.background.paper}`,
                        backgroundColor: (theme) => theme.palette.neutral[200],
                        borderRadius: '50%',
                        padding: 0,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[200],
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
                        color: (theme) => theme.palette.text.secondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                        textTransform: 'capitalize',
                        textAlign: 'center',
                        letterSpacing: '-0.48px',
                        maxWidth: { xs: '72px', md: '102px' },
                    }}
                    fontSize={{ xs: '12px', md: '16px' }}
                    fontWeight={500}
                    lineHeight={1.1}
                    component="h3"
                >
                    {name}
                </Typography>
            </FeatureImageBox>
        </Grid>
    )
}

export default FeaturedCategoryCard
