import CssBaseline from '@mui/material/CssBaseline'
import { NoSsr } from '@mui/material'
import Meta from '@/components/Meta'

import { checkMaintenanceMode } from '@/utils/customFunctions'
import { fetchPageMetadata, processMetadata } from '@/utils/fetchPageMetadata'
import RestaurantRegistrationLanding from '@/components/restaurant-resgistration-landing/Index'

const Index = ({ configData, registrationLandingPageData, metaData, pathName }) => {
    const metadata = processMetadata(metaData, {
        title: `Store registration Landing - ${configData?.business_name}`,
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
                <RestaurantRegistrationLanding configData={configData} data={registrationLandingPageData} />
            </NoSsr>
        </>
    )
}

export default Index;

export const getServerSideProps = async (context) => {
    const { req, resolvedUrl } = context
    const language = req.cookies?.languageSetting || 'en'
    const domain = req.headers.host
    const pathName = 'https://' + domain + resolvedUrl

    let configData = null
    let registrationLandingPageData = null
    let metaData = null

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
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/react-registration-page`,
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

        if (!landingPageRes.ok)
            throw new Error(`Landing page fetch failed: ${landingPageRes.status}`)

        registrationLandingPageData = await landingPageRes.json()
    } catch (error) {
        console.error('Landing page fetch error:', error)
    }

    // Fetch dynamic metadata for restaurant join page
    metaData = await fetchPageMetadata('restaurant_join_page', null, language)

    // Redirect to 404 if data is missing
    if (
        !configData ||
        (Array.isArray(configData) && configData.length === 0)
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
            registrationLandingPageData,
            metaData,
            pathName,
        },
    }
}
