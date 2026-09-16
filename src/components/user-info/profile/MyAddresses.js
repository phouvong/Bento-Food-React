import React, { useState } from 'react'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { Grid, Stack, Typography, useMediaQuery } from '@mui/material'
import { CustomTypography } from '../../custom-tables/Tables.style'
import { t } from 'i18next'
import { useTheme } from '@mui/material/styles'
import { useQuery } from 'react-query'
import { useGeolocated } from 'react-geolocated'
import { AddressApi } from '@/hooks/react-query/config/addressApi'
import { onSingleErrorResponse } from '../../ErrorResponse'
import AddressCard from '../address/AddressCard'
import CustomEmptyResult from '../../empty-view/CustomEmptyResult'
import Skeleton from '@mui/material/Skeleton'
import { noAddressFound } from '@/utils/LocalImages'
import AddressDrawer from '@/components/address-drawer/AddressDrawer'
import { MODES } from '@/components/address-drawer/addressDrawerConstants'
import { getToken } from '@/components/checkout-page/functions/getGuestUserId'

const MyAddresses = () => {
    const theme = useTheme()
    const token = getToken()
    const [isDefault, setIsDefault] = useState(0)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const isXs = useMediaQuery(theme.breakpoints.down('sm'))
    const { coords } = useGeolocated({
        positionOptions: { enableHighAccuracy: false },
        userDecisionTimeout: 5000,
        isGeolocationEnabled: true,
    })
    const { data, refetch, isFetching } = useQuery(
        ['address-list'],
        AddressApi.addressList,
        {
            enabled: Boolean(token),
            onError: onSingleErrorResponse,
        }
    )
    return (
        <CustomPaperBigCard
            padding={isXs ? '10px' : '15px 25px 25px'}
            noboxshadow="true"
        >
            <CustomStackFullWidth>
                <CustomStackFullWidth
                    justifyContent="space-between"
                    direction="row"
                    alignItems="center"
                    pb="10px"
                >
                    <CustomTypography
                        fontWeight="700"
                        color={theme.palette.text.primary}
                        sx={{
                            letterSpacing: '-0.54px',
                            lineHeight: 1.1,
                            fontSize: { xs: '15px', md: '18px' },
                        }}
                    >
                        {t('My Addresses')}
                    </CustomTypography>
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap="6px"
                        onClick={() => {
                            setEditTarget(null)
                            setDrawerOpen(true)
                        }}
                        sx={{ cursor: 'pointer' }}
                    >
                        <i
                            className="fi fi-rr-plus"
                            style={{
                                fontSize: isXs ? '14px' : '16px',
                                lineHeight: 1,
                                display: 'inline-flex',
                                color: theme.palette.text.info,
                            }}
                        />
                        <Typography
                            sx={{
                                fontSize: { xs: '13px', md: '16px' },
                                fontWeight: 500,
                                letterSpacing: '-0.48px',
                            }}
                            color={theme.palette.text.info}
                        >
                            {t('Add Address')}
                        </Typography>
                    </Stack>
                </CustomStackFullWidth>
                {!isFetching && (data?.data?.addresses?.length ?? 0) === 0 ? (
                    <Stack
                        width="100%"
                        alignItems="center"
                        justifyContent="center"
                        paddingBottom="35px"
                    >
                        <CustomEmptyResult
                            label="No Address Found!"
                            subTitle="Please add your address for better experience!"
                            image={noAddressFound}
                            height={59}
                            width={60}
                            labelFontSize="16px"
                            subTitleFontSize="14px"
                        />
                    </Stack>
                ) : (
                    <Grid container spacing={1.5}>
                        {data?.data?.addresses?.length > 0
                            ? data?.data?.addresses.map((address) => (
                                <Grid item xs={12} md={6} key={address?.id}>
                                    <AddressCard
                                        address={address}
                                        refetch={refetch}
                                        isDefault={isDefault}
                                        setIsDefault={setIsDefault}
                                        onEdit={(target) => {
                                            setEditTarget(target)
                                            setDrawerOpen(true)
                                        }}
                                    />
                                </Grid>
                            ))
                            : isFetching && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Skeleton
                                            variant="rounded"
                                            width="100%"
                                            height={150}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Skeleton
                                            variant="rounded"
                                            width="100%"
                                            height={150}
                                        />
                                    </Grid>
                                </>
                            )}
                    </Grid>
                )}
            </CustomStackFullWidth>

            {drawerOpen && (
                <AddressDrawer
                    mode={MODES.manage}
                    open={drawerOpen}
                    editAddress={editTarget}
                    onClose={() => {
                        setDrawerOpen(false)
                        setEditTarget(null)
                    }}
                    onSaved={refetch}
                    coords={coords}
                />
            )}
        </CustomPaperBigCard>
    )
}

export default MyAddresses
