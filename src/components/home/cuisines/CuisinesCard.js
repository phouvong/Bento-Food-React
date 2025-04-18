import React from 'react'
import CustomImageContainer from '../../CustomImageContainer'
import { Stack, Typography } from '@mui/material'
import Link from 'next/link'

const CuisinesCard = ({ item }) => {
    return (
        <>
            <Link href={`cuisines/${item?.id}?name=${item?.name}`} style={{textDecoration: 'none'}}>
                <Stack sx={{ overflow: 'hidden' }} spacing={1}>
                    <Stack
                        alignItems="center"
                        justifyContent="center"
                        paddingY={{ xs: '5px', md: '12px' }}
                        borderRadius="50%"
                        sx={{
                            transition: 'transform 0.5s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.1)',
                            },
                        }}
                    >
                        <CustomImageContainer
                            src={item?.image_full_url}
                            height="100px"
                            maxWidth="100px"
                            width="100%"
                            borderRadius="50%"
                            objectFit="cover"
                            smMb="5px"
                            smHeight="50px"
                            smMaxWidth="50px"
                            cursor="pointer"
                        />
                    </Stack>{' '}
                    <Typography
                        textAlign="center"
                        fontSize={{ xs: '13px', sm: '14px', md: '14px' }}
                        fontWeight="400"
                        sx={{
                            color: (theme) => theme.palette.neutral[1000],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: '1',
                            WebkitBoxOrient: 'vertical',
                            textDecoration: 'none'
                        }}
                        component="h3"
                    >
                        {item?.name}
                    </Typography>
                </Stack>
            </Link>
        </>
    )
}

export default CuisinesCard
