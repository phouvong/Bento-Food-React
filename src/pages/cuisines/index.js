import React from 'react'
import { CustomHeader } from '../../api/Headers'
import { landingPageApi } from '../../components/landingpage/Api'
import index from '../categories'
import Meta from '../../components/Meta'
import { t } from 'i18next'
import AllCuisines from '../../components/cuisines-page/AllCuisines'

const Index = () => {
    return (
        <>
            <Meta
                title={`${t('Categories')}`}


            />
            <AllCuisines />
        </>
    )
}

export default Index

