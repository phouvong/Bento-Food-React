import React from 'react'
import { NoSsr } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Meta from '../../components/Meta'
import { CustomHeader } from '@/api/Headers'
import TrackOrderInput from '../../components/Track-order/TrackOrderInput'
import HomeGuard from '../../components/home-guard/HomeGuard'
import CustomContainer from '@/components/container'
import MobilePageHeader from '@/components/page-header/MobilePageHeader'

const index = ({ configData }) => {
    const { t } = useTranslation()

    return (
        <div className="div">
            <Meta title={`Order Tracking - ${configData?.business_name}`} />
            <NoSsr>
                <HomeGuard>
                    <CustomContainer sx={{ mb: { xs: '72px', md: '0' } }}>
                        <MobilePageHeader title={t('Track Your Order')} />
                        <TrackOrderInput configData={configData} />
                    </CustomContainer>
                </HomeGuard>
            </NoSsr>
        </div>
    )
}

export default index
export const getServerSideProps = async () => {
    const configRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
        {
            method: 'GET',
            headers: CustomHeader,
        }
    )
    const config = await configRes.json()
    return {
        props: {
            configData: config,
        },
    }
}
