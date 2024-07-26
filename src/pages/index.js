import LandingPage from '../components/landingpage'
import React, { useEffect } from 'react'
import PushNotificationLayout from '../components/PushNotificationLayout'
import Meta from '../components/Meta'
import { setGlobalSettings } from "@/redux/slices/global"
import { useDispatch } from 'react-redux'
import Router, { useRouter } from "next/router";
import { CustomHeader } from "@/api/Headers"
import { useQuery } from "react-query";
import { ConfigApi } from "@/hooks/react-query/config/useConfig";
import { onSingleErrorResponse } from "@/components/ErrorResponse";


const Home = () => {

    const router=useRouter()
    const dispatch = useDispatch()
    // useEffect(() => {
    //     if (configData && landingPageData) {
    //         // Check if both are empty arrays
    //         if (configData.length === 0 && landingPageData.length === 0) {
    //             router.push('/404');
    //             return; // Prevent further execution
    //         }
    //         if (configData.maintenance_mode) {
    //             router.push('/maintenance');
    //             //return;
    //         }
    //         // dispatch(setGlobalSettings(configData));
    //     }
    // }, [configData, landingPageData, router, dispatch]);
    const { isLoading, data:configData, isError, error, refetch } = useQuery(
        ['config'],
        ConfigApi.config,
        {
            enabled: true,
            onError: onSingleErrorResponse,
            // onSuccess:handleConfigData,
            // staleTime: 1000 * 60 * 8,
            // cacheTime: 8 * 60 * 1000,
        }
    )

    console.log({configData});
    return (
        <>
            <Meta
                title={configData?.business_name}

            />
            <PushNotificationLayout>
                {configData && (
                    <LandingPage
                        global={configData?.data}

                    />
                )}
            </PushNotificationLayout>
        </>
    )
}
export default Home

// export const getServerSideProps = async (context) => {
//     const { req } = context
//     const language = req.cookies.languageSetting
//     const configRes = await fetch(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
//         {
//             method: 'GET',
//             headers: {
//                 'X-software-id': 33571750,
//                 'X-server': 'server',
//                 'X-localization': language,
//                 origin: process.env.NEXT_CLIENT_HOST_URL,
//             },
//         }
//     )
//     const config = await configRes.json()
//     const landingPageRes = await fetch(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/landing-page`,
//         {
//             method: 'GET',
//             headers: CustomHeader,
//         }
//     )
//     const landingPageData = await landingPageRes.json()
//     return {
//         props: {
//             configData: config,
//             landingPageData: landingPageData,
//         },
//     }
// }
