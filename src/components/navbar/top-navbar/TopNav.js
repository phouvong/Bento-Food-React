import { CustomStackForLoaction } from '@/styled-components/CustomStyles.style'
import { Box, Card, Container, Stack, Typography } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import useGetGuest from '../../../hooks/react-query/profile/useGetGuest'
import DrawerMenu from '../DrawerMenu'
import ThemeSwitches from './ThemeSwitches'
import AddressReselect from './address-reselect/AddressReselect'
import { useRouter } from 'next/router'
import CustomLanguage from '@/components/CustomLanguage'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import { useTranslation } from 'react-i18next'

const TopNav = ({ cartListRefetch, isSticky }) => {
    const theme = useTheme()
    const router = useRouter()
    const { t } = useTranslation()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const [userLocation, setUserLocation] = useState(null)
  

    const { userLocationUpdate } = useSelector(
        (state) => state.globalSettings
    )
    const { countryCode, language } = useSelector(
        (state) => state.languageChange
    )
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
        <Card
            elevation={0}
            sx={{
                borderRadius: 0,
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? theme.palette.background.paper
                        : 'linear-gradient(90deg,#FFF8F1 0%,#FFFFFF 100%)',
                borderBottom: (theme) =>
                    `1px solid ${
                        theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : '#E2E8F0'
                    }`,
            }}
        >
            <Toolbar
                sx={{
                    minHeight: '40px !important',
                    '@media (min-width: 600px)': {
                        minHeight: '40px !important',
                    },
                }}
                disableGutters={true}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            borderRadius: '0',
                            paddingBlock: { xs: '.25rem', md: '.4rem' },
                            justifyContent: 'space-between',
                        }}
                    >
                        <Stack
                            width="100%"
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <CustomStackForLoaction
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '5px 12px',
                                        borderRadius: '999px',
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.06)'
                                                : '#FFFFFF',
                                        border: (theme) =>
                                            `1px solid ${
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.12)'
                                                    : '#E2E8F0'
                                            }`,
                                        boxShadow:
                                            '0 1px 2px rgba(15,23,42,0.04)',
                                    }}
                                >
                                    <AddressReselect
                                        isSticky={isSticky}
                                        location={userLocation}
                                        userLocationUpdate={userLocationUpdate}
                                    />
                                </Box>
                                {/* {!isSmall && (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.5}
                                        sx={{
                                            pl: 1,
                                            borderLeft: (theme) =>
                                                `1px solid ${
                                                    theme.palette.mode ===
                                                    'dark'
                                                        ? 'rgba(255,255,255,0.1)'
                                                        : 'rgba(15,23,42,0.08)'
                                                }`,
                                        }}
                                    >
                                        <BoltRoundedIcon
                                            sx={{
                                                fontSize: '18px',
                                                color: (theme) =>
                                                    theme.palette.primary.main,
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: '13px',
                                                color: (theme) =>
                                                    theme.palette.mode ===
                                                    'dark'
                                                        ? theme.palette
                                                              .neutral[300]
                                                        : theme.palette
                                                              .neutral[900],
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {t('Deliver in')}{' '}
                                            <Box
                                                component="span"
                                                sx={{
                                                    color: (theme) =>
                                                        theme.palette.primary
                                                            .main,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                25-35 min
                                            </Box>
                                        </Typography>
                                    </Stack>
                                )} */}
                            </CustomStackForLoaction>
                            {!isSmall && (
                                <Stack
                                    direction="row"
                                    spacing={1.25}
                                    justifyContent="end"
                                    alignItems="center"
                                >
                                    <Typography
                                        onClick={() =>
                                            router.push('/tracking')
                                        }
                                        sx={{
                                            fontSize: '12.5px',
                                            color: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? theme.palette.neutral[300]
                                                    : '#334155',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'color 0.18s ease',
                                            '&:hover': {
                                                color: (theme) =>
                                                    theme.palette.primary.main,
                                            },
                                        }}
                                    >
                                        {t('Track Order')}
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: '1px',
                                            height: '14px',
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.12)'
                                                    : '#E2E8F0',
                                        }}
                                    />
                                    <Typography
                                        onClick={() =>
                                            router.push('/help-and-support')
                                        }
                                        sx={{
                                            fontSize: '12.5px',
                                            color: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? theme.palette.neutral[300]
                                                    : '#334155',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'color 0.18s ease',
                                            '&:hover': {
                                                color: (theme) =>
                                                    theme.palette.primary.main,
                                            },
                                        }}
                                    >
                                        {t('Help')}
                                    </Typography>
                                    <Box
                                        sx={{
                                            width: '1px',
                                            height: '14px',
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.12)'
                                                    : '#E2E8F0',
                                        }}
                                    />
                                    <Box>
                                        <CustomLanguage
                                            countryCode={countryCode}
                                            language={language}
                                            noLocation
                                        />
                                    </Box>
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
    )
}
export default withTranslation()(TopNav)
