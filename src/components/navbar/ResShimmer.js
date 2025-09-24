import React from 'react'
import Skeleton from '@mui/material/Skeleton'
import {
    Grid,
    MenuItem,
    ListItemIcon,
} from '@mui/material'

const ResShimmer = ({ shimmerfor }) => {
    return (
        <Grid item md={4}>
            {[...Array(shimmerfor === 'restaurant' ? 4 : 6)]?.map(
                (category, index) => {
                    return (
                        <MenuItem
                            key={index}
                            sx={{
                                alignItems: 'center',
                                gap: '5px',
                                borderRadius: '5px',
                            }}
                        >
                            <ListItemIcon>
                                <Skeleton
                                    width="35px"
                                    height="35px"
                                    variant="rectangular"
                                />
                            </ListItemIcon>
                            <Skeleton width={80} height="20px" variant="text" />
                            <Skeleton width={20} height="20px" variant="text" />
                        </MenuItem>
                    )
                }
            )}
        </Grid>
    )
}
export default ResShimmer
