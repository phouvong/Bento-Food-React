import React from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@mui/styles'
import { Typography, Stack, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { t } from 'i18next'

import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CouponCard from '@/components/user-info/coupon/CouponCard'
import NoCouponSvg from '@/components/checkout-page/order-summary/NoCouponSvg'

import 'simplebar-react/dist/simplebar.min.css'

const PromoSection = ({ title, data = [], loading, handleApply, global, showEmptyState ,isDisabled}) => {
    const theme = useTheme()
    const subTitle = t('Please add manually or collect promo from')

    return (
        <>
            <Typography fontSize="16px" fontWeight="600" textAlign="left" color={theme.palette.neutral[1000]}>
                {t(title)}
            </Typography>
            <Stack
                spacing={1}
                sx={{
                    backgroundColor: theme.palette.neutral[300],
                    padding: '10px',
                    borderRadius: '5px',
                    width: '100%',
                }}
            >
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <CouponCard
                            key={index}
                            loading={loading}
                            getCouponCodeFromCard={handleApply}
                            coupon={item}
                            fromCheckout
                            disabled={isDisabled}
                        />
                    ))
                ) : showEmptyState ? (
                    <Stack justifyContent="center" alignItems="center" spacing={1} width="100%">
                        <NoCouponSvg />
                        <Typography fontSize="14px" fontWeight="500">
                            {t('No Promo Available!')}
                        </Typography>
                        <Typography fontSize="12px" color={theme.palette.neutral[400]}>
                            {`${subTitle} ${global?.business_name}`}
                        </Typography>
                    </Stack>
                ) : null}
            </Stack>
        </>
    )
}

const CheckOutPromo = ({ data, handleApply, handleClose, loading }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const promoList = data?.data ?? []

    return (
        <CustomStackFullWidth spacing={1.5} sx={{ position: 'relative', padding: {
            xs:"1rem",
                md:"2rem"
            } }}>
            <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 0, right: -2 }}>
                <CloseIcon sx={{ fontSize: '16px' }} />
            </IconButton>
           <Stack sx={{maxHeight: {
               xs:"400px",
                   md:"600px"
               }, overflowY: 'scroll'}}>
               <PromoSection
                   title="Available Promo"
                   data={promoList?.available}
                   loading={loading}
                   handleApply={handleApply}
                   global={global}
                   showEmptyState
               />
               <PromoSection
                   title="Unavailable Promo"
                   data={promoList?.unavailable}
                   loading={loading}
                   handleApply={handleApply}
                   global={global}
                   showEmptyState
                   isDisabled
               />
           </Stack>
        </CustomStackFullWidth>
    )
}

export default CheckOutPromo
