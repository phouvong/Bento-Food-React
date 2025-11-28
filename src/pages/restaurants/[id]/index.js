import React, { useEffect } from 'react'
import { NoSsr } from '@mui/material'
import RestaurantDetails from '../../../components/restaurant-details/RestaurantDetails'
import Meta from '../../../components/Meta'
import MainApi from '../../../api/MainApi'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { setGlobalSettings } from '@/redux/slices/global'

const RestaurantDetailsPage = ({ restaurantData, configData }) => {
    const router = useRouter()
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setGlobalSettings(configData))
    }, [])

    useEffect(() => {
        if (configData) {
            if (configData.maintenance_mode) {
                router.push('/maintenance')
            }
        }
    }, [configData, router])


    // Process metadata from restaurantData
    const pageTitle = restaurantData?.meta_title
        ? `${restaurantData.meta_title} - ${configData?.business_name}`
        : `${restaurantData?.name} - ${configData?.business_name}`
    const pageDescription = restaurantData?.meta_description || ''
    const pageImage = restaurantData?.meta_image_full_url ||
        `${configData?.base_urls?.restaurant_image_url}/${restaurantData?.meta_image}`
    console.log({ restaurantData });

    return (
        <>
            <Meta
                title={pageTitle}
                description={pageDescription}
                ogImage={pageImage}
                robotsMeta={restaurantData?.meta_data}
            />
            <NoSsr>
                <RestaurantDetails restaurantData={restaurantData} />
            </NoSsr>
        </>
    )
}

export default RestaurantDetailsPage

export async function getStaticPaths() {
    try {
        const popularRestaurants = await MainApi.get('/api/v1/restaurants/popular')
        const paths = popularRestaurants.data.slice(0, 10).map(restaurant => ({
            params: { slug: restaurant.slug, id: restaurant.id.toString() }
        }))

        return {
            paths,
            fallback: 'blocking'
        }
    } catch (error) {
        return {
            paths: [],
            fallback: 'blocking'
        }
    }
}

export async function getStaticProps(context) {
    const id = context.params.slug || context.params.id

    try {
        // Fetch restaurants data
        const data = await MainApi.get(`/api/v1/restaurants/details/${id}`)

        // Fetch config data
        const configRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
            {
                method: 'GET',
                headers: {
                    'X-software-id': 33571750,
                    'X-server': 'server',
                    'X-localization': 'en',
                    origin: process.env.NEXT_CLIENT_HOST_URL,
                },
            }
        )
        const config = await configRes.json()

        return {
            props: {
                restaurantData: data.data,
                configData: config,
            },
            // Using a longer revalidation time since we'll use on-demand revalidation
            revalidate: 60,
        }
    } catch (error) {
        console.error('Error fetching restaurants data:', error)
        return {
            notFound: true,
        }
    }
}

