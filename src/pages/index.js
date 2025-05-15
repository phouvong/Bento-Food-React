import LandingPage from '../components/landingpage'
import React, { useEffect } from 'react'
import PushNotificationLayout from '../components/PushNotificationLayout'
import Meta from '../components/Meta'
import { setGlobalSettings } from '@/redux/slices/global'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { CustomHeader } from '@/api/Headers'
import { checkMaintenanceMode } from '@/utils/customFunctions'

const Home = ({ configData, landingPageData }) => {
    const router = useRouter()
    const dispatch = useDispatch()

    useEffect(() => {
        if (configData && landingPageData) {
            if (configData.length === 0 && landingPageData.length === 0) {
                router.push('/404')
                return
            }

            if (checkMaintenanceMode(configData)) {
                router.push('/maintenance')
                return
            }
            dispatch(setGlobalSettings(configData))
        }
    }, [configData, landingPageData, router, dispatch])

    return (
        <>
            <Meta
                title={configData?.business_name}
                ogImage={`${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`}
            />
            <PushNotificationLayout>
                {configData && (
                    <LandingPage
                        global={configData}
                        landingPageData={landingPageData}
                    />
                )}
            </PushNotificationLayout>
        </>
    )
}

export default Home

export const getServerSideProps = async (context) => {
    const { req } = context
    const language = req.cookies.languageSetting

    let configData = null
    let landingPageData = null

    try {
        const configRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
            {
                method: 'GET',
                headers: {
                    'X-software-id': 33571750,
                    'X-server': 'server',
                    'X-localization': language,
                    origin: process.env.NEXT_CLIENT_HOST_URL,
                },
            }
        )

        if (!configRes.ok) {
            console.error(
                'Error fetching config data:',
                configRes.status,
                configRes.statusText
            )
            throw new Error(`Failed to fetch config data: ${configRes.status}`)
        }

        configData = await configRes.json()
    } catch (error) {
        console.error('Error in config data fetch:', error)
    }

    try {
        const landingPageRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/landing-page`,
            {
                method: 'GET',
                headers: CustomHeader,
            }
        )

        if (!landingPageRes.ok) {
            console.error(
                'Error fetching landing page data:',
                landingPageRes.status,
                landingPageRes.statusText
            )
            throw new Error(
                `Failed to fetch landing page data: ${landingPageRes.status}`
            )
        }

        landingPageData = await landingPageRes.json()
    } catch (error) {
        console.error('Error in landing page data fetch:', error)
    }

    return {
        props: {
            configData,
            landingPageData,
        },
    }
}
