import React, { useEffect } from 'react'
import { Grid, Stack } from '@mui/material'
import { CustomBoxFullWidth } from '@/styled-components/CustomStyles.style'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

const CustomShimmerCategories = ({
    noSearchShimmer,
    itemCount,
    smItemCount,
    gridControl,
}) => {
    const [count, setCount] = React.useState(null)
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const isMd = useMediaQuery(theme.breakpoints.down('lg'))
    useEffect(() => {
        setCount(Number(itemCount))
    }, [count])
    useEffect(() => {
        if (isXSmall) {
            setCount(Number(smItemCount))
        } else if (isSmall) {
            setCount(4)
        } else if (isMd) {
            setCount(10)
        }
    }, [isXSmall, isSmall, isMd, count])

    return (
        <CustomBoxFullWidth mt="1rem">
            <Grid container justifyContent="center" spacing={4}>
                {noSearchShimmer !== 'true' && (
                    <>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="text" width={130} height={20} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Skeleton
                                variant="rectangle"
                                width="100%"
                                height={40}
                            />
                        </Grid>
                    </>
                )}

                {[...Array(count)].map((categoryItem, index) => (
                    <Grid
                        item
                        md={1.5}
                        sm={3}
                        xs={gridControl === 'true' ? 4 : 2.2}
                        mt=".5rem"
                        key={index}
                    >
                        <Stack
                            width="100%"
                            spacing={1}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Skeleton
                                sx={{ borderRadius: '32px' }}
                                variant="repeating"
                                animation="wave"
                                width={isXSmall ? 40 : 98}
                                height={isXSmall ? 40 : 98}
                            />
                            <Skeleton
                                variant="text"
                                animation="wave"
                                width={isXSmall ? 20 : 70}
                                height={isXSmall ? 20 : 20}
                            />
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </CustomBoxFullWidth>
    )
}

export default CustomShimmerCategories
