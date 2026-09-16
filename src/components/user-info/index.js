import React from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { Grid, useMediaQuery, useTheme } from '@mui/material'
import ProfileSideMenu from './ProfileSideMenu'
import ProfileBody from './ProfileBody'
import 'simplebar-react/dist/simplebar.min.css'

const UserInfo = ({ page, orderId, setAttributeId, isAuthenticated }) => {
    const theme = useTheme()
    const isXs = useMediaQuery(theme.breakpoints.down('sm'))

    return (
        <CustomStackFullWidth sx={{ paddingTop: { xs: '15px', md: '24px' } }}>
            <Grid container spacing={2}>
                <Grid
                    item
                    xs={0}
                    sm={0}
                    md={3}
                    sx={{
                        display: { xs: 'none', md: 'block' },
                    }}
                    mb={isXs ? '20px' : '20px'}
                >
                    <ProfileSideMenu
                        page={page}
                        setAttributeId={setAttributeId}
                        isAuthenticated={isAuthenticated}
                    />
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={9}
                    mb={isXs ? '20px' : '20px'}
                >
                    <ProfileBody
                        page={page}
                        orderId={orderId}
                        isAuthenticated={isAuthenticated}
                    />
                </Grid>
            </Grid>
        </CustomStackFullWidth>
    )
}

export default UserInfo
