import React from 'react'
import { Box, CssBaseline } from '@mui/material'
import ResturantList from './ResturantList'
import CustomPageTitleSubtitle from '../CustomPageTitleSubtitle'
import CustomContainer from '../container'
import HomeSidebar from '@/components/home/home-sidebar/HomeSidebar'

const Searchresturant = ({ restaurantType, title, description }) => {
    return (
        <>
            <CssBaseline />
            <CustomContainer>
                <Box
                    sx={{
                        marginTop: {xs:'5rem',md:"7rem"},
                        display: { xs: 'block', md: 'grid' },
                        gridTemplateColumns: { md: '260px 1fr' },
                        columnGap: { md: '28px' },
                    }}
                >
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            position: 'relative',
                        }}
                    >
                        <HomeSidebar />
                    </Box>
                    <Box sx={{ minWidth: 0,marginTop:{xs:"1.5rem",md:"1.5rem"}  }}>
                        <>
                            <CustomPageTitleSubtitle
                                title={title}
                                subtitle={description}
                            />
                            <ResturantList restaurantType={restaurantType} />
                        </>
                    </Box>
                </Box>
            </CustomContainer>
        </>
    )
}

export default Searchresturant
