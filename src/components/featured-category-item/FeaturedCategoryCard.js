import { Grid, Typography, Box } from '@mui/material'
import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CustomImageContainer from '../CustomImageContainer'
import { FeatureImageBox } from './FeaturedCategory.style'
import Router, { useRouter } from 'next/router'
import CustomNextImage from '@/components/CustomNextImage'
import Image from 'next/image'

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
    
    const handleClick = () => {
        Router.push(
            {
                pathname: `/category/${slug || id}`,
                query: { name: name },
            },
            undefined,
            { shallow: true }
        )
    }
    const getSize = () => {
        if (isSmall) {
            return image ? 55 : 30;
        } else if (categoryIsSticky) {
            return image ? 50 : 30;
        } else {
            return image ? 100 : 60;
        }
    };

    const size = getSize();
    return (
        <Grid item sx={{ overflow: 'hidden' }} onClick={handleClick}>
            <FeatureImageBox
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 0.5, md: 1 }}
            >
                <Box
                    sx={{

                        height: {
                            xs: '55px',
                            md: categoryIsSticky ? '50px' : '100px',
                        },
                        display: 'flex',
                        width: {
                            xs: '55px',
                            md: categoryIsSticky ? '50px' : '100px',
                        },
                        border: '1px solid',
                        borderColor: (theme) => theme.palette.neutral[200],
                        borderRadius: '50%',
                        transition: `all ease 0.5s`,
                        '&:hover': {
                            transform: 'scale(1.03)',
                        },
                        animation: 'fadeInRight 2s  1',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CustomNextImage
                        src={image}
                        alt={name}
                        width={size}
                        height={size}
                        borderRadius={
                            router.pathname === '/categories' && isXSmall
                                ? '16px'
                                : '50%'
                        }
                        objectFit={image ? 'cover':"contain"}
                    />
                </Box>
                <Typography
                    sx={{
                        color: (theme) => theme.palette.neutral[1200],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                        transition: "all 0.2s ease", // 👈 smooth transition
                        "&:hover": {
                            color: (theme) => theme.palette.primary.main,
                            //fontWeight: "600",
                            transform: 'scale(1.06)',
                        },
                    }}
                    fontSize={{ xs: '13px', sm: '14px', md: '14px' }}
                    fontWeight="400"
                    component="h3"
                >
                    {name}
                </Typography>
            </FeatureImageBox>
        </Grid>
    )
}

export default FeaturedCategoryCard
