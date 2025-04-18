import CssBaseline from '@mui/material/CssBaseline'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import CustomContainer from '../../components/container'
import { getServerSideProps } from '../index'

import DeliveryManComponent from '@/components/deliveryman-registration/DeliveryManComponent'
import Meta from '@/components/Meta'

const Index = ({ configData, landingPageData }) => {
    const router = useRouter()

    return (
        <>
            <CssBaseline />
            <Meta
                title={`Deliveryman Registration - ${configData?.business_name}`}
            />
            <CustomContainer>
                <DeliveryManComponent
                    configData={configData}
                    landingPageData={landingPageData}
                />
            </CustomContainer>
        </>
    )
}

export default Index

export { getServerSideProps }
