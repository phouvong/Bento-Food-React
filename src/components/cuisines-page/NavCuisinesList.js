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
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    '&:hover': {
                        backgroundColor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                    },
                }}
            >
                <ListItemIcon sx={{ minWidth: 'auto', margin: 0 }}>
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
                    fontSize="14px"
                    variant="h5"
                    fontWeight="600"
                    color={theme.palette.neutral[1000]}
                    sx={{
                        maxWidth: '110px',
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
