import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import LandingPage from '../components/landingpage'
import PushNotificationLayout from '../components/PushNotificationLayout'
import Meta from '../components/Meta'
import { CustomHeader } from '@/api/Headers'
import { checkMaintenanceMode } from '@/utils/customFunctions'
import { setGlobalSettings } from '@/redux/slices/global'
import { setLandingPageData } from '@/redux/slices/storedData'

const Home = ({ configData, landingPageData }) => {
    const dispatch = useDispatch()

    useEffect(() => {
        if (configData) {
            dispatch(setGlobalSettings(configData))
        }
        if (landingPageData) {
            dispatch(setLandingPageData(landingPageData))
        }
    }, [configData, landingPageData])

    return (
        <>
            <Meta
                title={configData?.business_name || 'Home'}
                ogImage={
                    configData?.base_urls?.react_landing_page_images &&
                    landingPageData?.banner_section_full?.banner_section_img_full
                        ? `${configData.base_urls.react_landing_page_images}/${landingPageData.banner_section_full.banner_section_img_full}`
                        : '/default-og-image.jpg'
                }
            />
            <PushNotificationLayout>
                <LandingPage
                    global={configData}
                    landingPageData={landingPageData}
                />
            </PushNotificationLayout>
        </>
    )
}

export default Home

export const getServerSideProps = async (context) => {
    const { req } = context
    const language = req.cookies?.languageSetting || 'en'

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

        if (!configRes.ok) throw new Error(`Config fetch failed: ${configRes.status}`)

        configData = await configRes.json()
    } catch (error) {
        console.error('Config fetch error:', error)
    }

    try {
        const landingPageRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/react-landing-page`,
            {
                method: 'GET',
                headers: CustomHeader,
            }
        )

        if (!landingPageRes.ok)
            throw new Error(`Landing page fetch failed: ${landingPageRes.status}`)

        landingPageData = await landingPageRes.json()
    } catch (error) {
        console.error('Landing page fetch error:', error)
    }

    // Redirect to 404 if data is missing
    if (
        !configData ||
        !landingPageData ||
        (Array.isArray(configData) && configData.length === 0) ||
        (Array.isArray(landingPageData) && landingPageData.length === 0)
    ) {
        return {
            redirect: {
                destination: '/404',
                permanent: false,
            },
        }
    }

    // Redirect to maintenance page if needed
    if (checkMaintenanceMode(configData)) {
        return {
            redirect: {
                destination: '/maintenance',
                permanent: false,
            },
        }
    }

    return {
        props: {
            configData,
            landingPageData,
        },
    }
}