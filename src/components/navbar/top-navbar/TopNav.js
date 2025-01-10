import { CustomStackForLoaction } from '@/styled-components/CustomStyles.style'
import { Box, Card, Container, NoSsr, Stack } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import useGetGuest from '../../../hooks/react-query/profile/useGetGuest'
import DrawerMenu from '../DrawerMenu'
import LogoSide from '../second-navbar/LogoSide'
import ThemeSwitches from './ThemeSwitches'
import AddressReselect from './address-reselect/AddressReselect'

const TopNav = ({ cartListRefetch }) => {
    const theme = useTheme()

    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const [userLocation, setUserLocation] = useState(null)
    const { global, userLocationUpdate } = useSelector(
        (state) => state.globalSettings
    )
    const businessLogo = global?.fav_icon_full_url
    let guestId
    let zoneid = undefined
    if (typeof window !== 'undefined') {
        zoneid = JSON.parse(localStorage.getItem('zoneid'))
    }
    if (typeof window !== 'undefined') {
        localStorage.getItem('direction')
    }
    useEffect(() => {
        let location = undefined
        if (typeof window !== 'undefined') {
            location = localStorage.getItem('location')
        }

        setUserLocation(location)
    }, [userLocationUpdate])

    if (typeof window !== 'undefined') {
        guestId = localStorage.getItem('guest_id')
    }

    const {
        data: guestData,
        refetch: guestRefetch,
        isLoading: guestIsLoading,
    } = useGetGuest()

    useEffect(() => {
        if ((!guestId || guestId === 'undefined') && !guestIsLoading) {
            guestRefetch()
        }
    }, [])

    useEffect(() => {
        if (guestData?.guest_id) {
            localStorage.setItem('guest_id', guestData.guest_id)
            guestId = guestData.guest_id
        }
    }, [guestData])

    return (
        <NoSsr>
            <Card
                sx={{ borderRadius: '0px', zIndex: '99', position: 'relative' }}
            >
                <Toolbar
                    sx={{ minHeight: '45px !important' }}
                    disableGutters={true}
                >
                    <Container maxWidth="lg">
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                borderRadius: '0',
                                paddingBlock: { xs: '.0rem', md: '.8rem' },
                                justifyContent: 'space-between',
                            }}
                        >
                            <Stack
                                width="100%"
                                direction="row"
                                justifyContent="space-between"
                            >
                                <CustomStackForLoaction
                                    direction="row"
                                    spacing={2}
                                >
                                    {global ? (
                                        <LogoSide
                                            global={global}
                                            width="unset"
                                            businessLogo={businessLogo}
                                        />
                                    ) : (
                                        <Skeleton width="40px" />
                                    )}

                                    <AddressReselect
                                        location={userLocation}
                                        userLocationUpdate={userLocationUpdate}
                                    />
                                </CustomStackForLoaction>
                                {!isSmall && (
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        justifyContent="end"
                                    >
                                        <ThemeSwitches />
                                    </Stack>
                                )}
                            </Stack>
                            {isSmall && (
                                <DrawerMenu
                                    zoneid={zoneid}
                                    cartListRefetch={cartListRefetch}
                                />
                            )}
                        </Box>
                    </Container>
                </Toolbar>
            </Card>
        </NoSsr>
    )
}
export default withTranslation()(TopNav)
