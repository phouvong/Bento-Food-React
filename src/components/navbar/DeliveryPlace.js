import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { CustomStackForLoaction } from '@/styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import AddressReselect from './top-navbar/address-reselect/AddressReselect'

const DeliveryPlace = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    let location = undefined

    if (typeof window !== 'undefined') {
        location = localStorage.getItem('location')
    }

    return (
        <Box sx={{ display: { xs: 'inline', md: 'none' } }}>
            <Stack paddingTop="1.5rem" paddingBottom="1rem">
                <Typography align="center" color={theme.palette.neutral[500]}>
                    {t('Delivering to')}:{' '}
                </Typography>
                <CustomStackForLoaction direction="row" spacing={1}>
                    {location && <AddressReselect location={location} />}
                </CustomStackForLoaction>
            </Stack>
        </Box>
    )
}
export default DeliveryPlace
