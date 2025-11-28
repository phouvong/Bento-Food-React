import React from 'react'
import LandingPage from '../components/landingpage'
import PushNotificationLayout from '../components/PushNotificationLayout'
import Meta from '../components/Meta'
import { CustomHeader } from '@/api/Headers'
import { checkMaintenanceMode } from '@/utils/customFunctions'
import Head from 'next/head'
import { NoSsr } from '@mui/material'


const Home = ({ configData, landingPageData }) => {
    // Process metadata from landingPageData
    const metaData = landingPageData?.meta_data
    const pageTitle = metaData?.meta_data_title || configData?.business_name || 'Home'
    const pageDescription = metaData?.meta_data_description || ''
    const pageImage = metaData?.meta_data_image_full_url ||
        (configData?.base_urls?.react_landing_page_images && landingPageData?.banner_section_full?.banner_section_img_full
            ? `${configData.base_urls.react_landing_page_images}/${landingPageData.banner_section_full.banner_section_img_full}`
            : '/default-og-image.jpg')

    // Build robots meta from landingPageData.meta_data
    const robotsMeta = metaData ? {
        meta_index: metaData.meta_data_index,
        meta_no_follow: metaData.meta_data_no_follow,
        meta_no_image_index: metaData.meta_data_no_image_index,
        meta_no_archive: metaData.meta_data_no_archive,
        meta_no_snippet: metaData.meta_data_no_snippet,
        meta_max_snippet: metaData.meta_data_max_snippet,
        meta_max_snippet_value: metaData.meta_data_max_snippet_value,
        meta_max_video_preview: metaData.meta_data_max_video_preview,
        meta_max_video_preview_value: metaData.meta_data_max_video_preview_value,
        meta_max_image_preview: metaData.meta_data_max_image_preview,
        meta_max_image_preview_value: metaData.meta_data_max_image_preview_value,
    } : null


    return (
        <>
            <Meta
                title={pageTitle}
                description={pageDescription}
                ogImage={pageImage}
                robotsMeta={robotsMeta}
            />
            <PushNotificationLayout>
                <NoSsr>
                    <LandingPage
                        global={configData}
                        landingPageData={landingPageData}
                    />
                </NoSsr>
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
                    'X-Software-Id': '33571750', // make sure it’s a string
                    'X-Server': 'server',
                    'X-Localization': language,
                    Origin:
                        process.env.NEXT_CLIENT_HOST_URL ||
                        'http://localhost:3001',
                },
                cache: 'no-store',
            }
        )
        if (!configRes.ok)
            throw new Error(`Config fetch failed: ${configRes.status}`)

        configData = await configRes.json()
    } catch (error) {
        console.error('Config fetch error:', error)
    }
    try {
        const landingPageRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/react-landing-page`,
            {
                method: 'GET',
                headers: {
                    'X-Software-Id': '33571750', // make sure it’s a string
                    'X-Server': 'server',
                    'X-Localization': language,
                    Origin:
                        process.env.NEXT_CLIENT_HOST_URL ||
                        'http://localhost:3001',
                },
                cache: 'no-store',
            }
        )

        if (!landingPageRes.ok)
            throw new Error(
                `Landing page fetch failed: ${landingPageRes.status}`
            )

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
