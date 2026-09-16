import React, { useEffect } from 'react'
import CheckOut from '../../components/checkout-page/CheckOut'
import Meta from '../../components/Meta'
import { Container, CssBaseline, NoSsr } from '@mui/material'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import Router, { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import CustomContainer from '../../components/container'
import HomeGuard from '../../components/home-guard/HomeGuard'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'
import { getServerSideProps } from '../index'
const CheckoutLayout = ({ configdata }) => {
    const { cartList } = useSelector((state) => state.cart)
    const { token } = useSelector((state) => state.userToken)
    const router = useRouter()
    const { page, isDineIn } = router.query
    const { global } = useSelector((state) => state.globalSettings)
    const { t } = useTranslation()

    return (
        <>
            <HomeGuard from="checkout" page={page}>
                <CssBaseline />
                <CustomContainer>
                    <MobilePageHeader title={t('Checkout')} />
                    <CustomStackFullWidth
                        sx={{ marginTop: { xs: 0, sm: '5rem' } }}
                    >
                        <Meta
                            title={global?.business_name ? `Checkout on ${global.business_name}` : 'Checkout'}
                            description=""
                            keywords=""
                        />
                        <NoSsr>
                            {page === 'campaign' && <CheckOut />}
                            {page !== 'campaign' && cartList?.length > 0 && (
                                <CheckOut isDineIn={isDineIn} />
                            )}
                        </NoSsr>
                    </CustomStackFullWidth>
                </CustomContainer>
            </HomeGuard>
        </>
    )
}
export default CheckoutLayout
