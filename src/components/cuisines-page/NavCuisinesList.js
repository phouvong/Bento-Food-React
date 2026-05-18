import React from 'react'
import Link from 'next/link'
import MenuItem from '@mui/material/MenuItem'
import { alpha, ListItemIcon, Typography, useTheme } from '@mui/material'
import CustomImageContainer from '../CustomImageContainer'

const NavCuisinesList = ({ item, handledropClose }) => {
    const theme = useTheme();

    return (
        <Link
            href={{
                pathname: `/cuisines/${item.slug || item?.id}`,

            }}
            key={item?.id}
            style={{ textDecoration: 'none' }}
        >
            <MenuItem
                onClick={handledropClose}
                sx={{
                    alignItems: 'center',
                   
                    borderRadius: '5px',
                    '&:hover': {
                        backgroundColor: (theme) =>
                            alpha(theme.palette.primary.main, 0.3),
                    },
                }}
            >
                <ListItemIcon>
                    <CustomImageContainer
                        src={item.image_full_url}
                        width="40px"
                        height="40px"
                        loading="lazy"
                        objectFit="cover"
                        borderRadius="50%"
                    />
                </ListItemIcon>
                <Typography
                    fontSize="13px"
                    variant="h5"
                    fontWeight="600"
                    color={theme.palette.neutral[1000]}
                    sx={{
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item.name}
                </Typography>
            </MenuItem>
        </Link>
    )
}

export default NavCuisinesList
