import CssBaseline from '@mui/material/CssBaseline'
import { NoSsr } from '@mui/material'
import React from 'react'
import CustomContainer from '../../components/container'
import DeliveryManComponent from '@/components/deliveryman-registration/DeliveryManComponent'
import Meta from '@/components/Meta'
import { processMetadata } from '@/utils/fetchPageMetadata'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'

const Index = ({ configData, landingPageData, metaData, pathName }) => {
    const metadata = processMetadata(metaData, {
        title: `Deliveryman Registration - ${configData?.business_name}`,
        description: '',
        image: configData?.logo_full_url
    })

    return (
        <>
            <CssBaseline />
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <CustomContainer>
                    <DeliveryManComponent
                        configData={configData}
                        landingPageData={landingPageData}
                    />
                </CustomContainer>
            </NoSsr>
        </>
    )
}

export default Index

export const getServerSideProps = async (context) => {
    return await getCommonServerSideProps(context, 'deliveryman_join_page')
}