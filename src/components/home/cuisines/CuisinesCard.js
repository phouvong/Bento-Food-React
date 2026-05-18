import React from 'react'
import { Box, Typography, styled } from '@mui/material'
import Link from 'next/link'
import CustomNextImage from '@/components/CustomNextImage'

const Tile = styled(Box)(({ theme }) => ({
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.palette.common.black,
    transition: 'transform .18s ease, box-shadow .18s ease',
    cursor: 'pointer',
    '& .cuisine-img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: 0.88,
        transition: 'transform .35s ease, opacity .35s ease',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        background:
            'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.72) 100%)',
    },
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 14px -6px rgba(20,20,20,.18)',
        '& .cuisine-img': {
            transform: 'scale(1.05)',
            opacity: 1,
        },
    },
}))

const Name = styled(Typography)(({ theme }) => ({
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    zIndex: 1,
    color: theme.palette.common.white,
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: '-0.005em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
}))

const CuisinesCard = ({ item }) => {
    return (
        <Link
            href={{ pathname: `/cuisines/${item?.slug || item?.id}` }}
            style={{ textDecoration: 'none' }}
        >
            <Box sx={{ px: { xs: '4px', md: '0px' } }}>
                <Tile>
                    <CustomNextImage
                        className="cuisine-img"
                        src={item?.image_full_url}
                        alt={item?.name}
                        width="162"
                        height="162"
                        objectFit="cover"
                    />
                    <Name component="h3">{item?.name}</Name>
                </Tile>
            </Box>
        </Link>
    )
}

export default CuisinesCard
