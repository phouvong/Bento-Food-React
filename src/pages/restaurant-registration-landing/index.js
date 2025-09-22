import CssBaseline from '@mui/material/CssBaseline'
import Meta from '@/components/Meta'
import RestaurantRegistrationLanding from '@/components/restaurant-resgistration-landing'
import { CustomHeader } from '@/api/Headers'
import { checkMaintenanceMode } from '@/utils/customFunctions'

const Index = ({ configData ,registrationLandingPageData}) => {
    // useScrollToTop()
    return (
        <>
            <CssBaseline />
            <Meta title={`Store registration Landing - ${configData?.business_name}`} />
            <RestaurantRegistrationLanding configData={configData} data={registrationLandingPageData} />
        </>
    )
}

export default Index;

export const getServerSideProps = async (context) => {
    const { req } = context
    const language = req.cookies?.languageSetting || 'en'

    let configData = null
    let registrationLandingPageData = null

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
        },
    }
}
