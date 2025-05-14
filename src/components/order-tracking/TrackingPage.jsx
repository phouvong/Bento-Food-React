import React, { useState, useEffect } from 'react'
import {
    Grid,
    Step,
    StepLabel,
    Typography,
    Skeleton,
    IconButton,
} from '@mui/material'
import { CustomStepperStyled } from './CustomStepper'
import { StepBox } from './Tracking.style'
import MapComponent from '../restaurant-details/google-address/MapComponent'
import { useTranslation } from 'react-i18next'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomFormatedTime from '../date/CustomFormatedTime'
import DeliverymanInfo from './DeliverymanInfo'
import DeliverymanShimmer from './DeliverymanShimmer'
import SimpleBar from 'simplebar-react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { RTL } from '../RTL/RTL'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import { useGeolocated } from 'react-geolocated'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'

const TrackingPage = ({ data, guestOrderTracking }) => {
    const [actStep, setActStep] = useState(1)
    const [rerenderMap, setRerenderMap] = useState(false)

    const steps = [
        {
            label: 'Order placed',
            time: data?.pending,
        },
        {
            label: 'Order Confirmed',
            time: data?.confirmed,
        },
        {
            label: 'Preparing Food',
            time: data?.processing,
        },
        {
            label: 'Food is on the way',
            time: data?.picked_up,
        },
        {
            label: 'Delivered',
            time: data?.delivered,
        },
    ]
    useEffect(() => {
        if (data?.order_status === 'panding') {
            setActStep(1)
        } else if (data?.order_status === 'confirmed') {
            setActStep(2)
        } else if (
            data?.order_status === 'processing' ||
            data?.order_status === 'handover'
        ) {
            setActStep(3)
        } else if (data?.order_status === 'picked_up') {
            setActStep(4)
        } else if (data?.order_status === 'delivered') {
            setActStep(5)
        }
    }, [actStep, data])
    const [userLocation, setUserLocation] = useState({
        lat: '',
        lng: '',
    })

    useEffect(() => {
        setUserLocation({
            lat: data?.delivery_address?.latitude,
            lng: data?.delivery_address?.longitude,
        })
    }, [data])
    // const deliveryLat = data?.delivery_address?.latitude;
    // const deliveryLong = data?.delivery_address?.longitude;
    const resLat = data?.restaurant?.latitude
    const resLong = data?.restaurant?.longitude
    const { t } = useTranslation()
    const theme = useTheme()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))

    const [languageDirection, setLanguageDirection] = useState('ltr')
    useEffect(() => {
        if (localStorage.getItem('direction')) {
            setLanguageDirection(localStorage.getItem('direction'))
        }
    }, [])
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: false,
            },
            userDecisionTimeout: 5000,
            isGeolocationEnabled: true,
        })
    const setUserCurrentLocation = () => {
        setUserLocation({
            lat: coords?.latitude,
            lng: coords?.longitude,
        })
        setRerenderMap((prvMap) => !prvMap)
    }
    
    return (
        <RTL direction={languageDirection}>
            <CustomStackFullWidth>
                <Grid container item md={12} xs={12} mb="1rem">
                    <Grid item md={12} xs={12}>
                        <SimpleBar
                            style={{ height: isSmall ? '120px' : '150px' }}
                        >
                            <RTL>
                                <StepBox>
                                    <CustomStepperStyled
                                        activeStep={actStep}
                                        alternativeLabel
                                    >
                                        {steps.map((labels, index) => (
                                            <Step key={labels}>
                                                <StepLabel>
                                                    <Typography>
                                                        {t(labels.label)}
                                                    </Typography>
                                                    {data ? (
                                                        <Typography
                                                            fontSize={{
                                                                xs: '10px',
                                                                sm: '12px',
                                                            }}
                                                            color={
                                                                theme.palette
                                                                    .neutral[600]
                                                            }
                                                        >
                                                            {labels.time !==
                                                            null ? (
                                                                <CustomFormatedTime
                                                                    date={
                                                                        labels.time
                                                                    }
                                                                />
                                                            ) : (
                                                                ''
                                                            )}
                                                        </Typography>
                                                    ) : (
                                                        <Skeleton variant="text" />
                                                    )}
                                                </StepLabel>
                                            </Step>
                                        ))}
                                    </CustomStepperStyled>
                                </StepBox>
                            </RTL>
                        </SimpleBar>
                    </Grid>
                    <Grid
                        item
                        md={12}
                        xs={12}
                        p="1.4rem"
                        sx={{ position: 'relative' }}
                    >
                        <MapComponent
                            key={rerenderMap}
                            isRestaurant
                            latitude={resLat}
                            longitude={resLong}
                            userLat={userLocation?.lat}
                            userLong={userLocation?.lng}
                        />
                        <IconButton
                            sx={{
                                background: (theme) =>
                                    theme.palette.neutral[100],
                                padding: '10px',
                                position: 'absolute',
                                bottom: '30px',
                                right: '30px',
                            }}
                            onClick={setUserCurrentLocation}
                        >
                            <GpsFixedIcon color="primary" />
                        </IconButton>
                    </Grid>
                    {data?.order_type === 'delivery' && (
                        <Grid item md={12} xs={12} align="center" p="1.4rem">
                            {data ? (
                                data?.delivery_man ? (
                                    <DeliverymanInfo data={data} />
                                ) : (
                                    <Typography>
                                        {t(
                                            'Delivery man has not been assigned'
                                        )}
                                    </Typography>
                                )
                            ) : (
                                <DeliverymanShimmer />
                            )}
                        </Grid>
                    )}
                </Grid>
            </CustomStackFullWidth>
        </RTL>
    )
}

export default TrackingPage
