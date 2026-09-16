import React from 'react'
import { NoSsr } from '@mui/material'
import { useTranslation } from 'react-i18next'
import TypeWiseRestaurant from '@/components/type-wise-restaurant-page/TypeWiseRestaurant'
import Meta from '@/components/Meta'
import HomeGuard from '@/components/home-guard/HomeGuard'
import { getCommonServerSideProps } from '@/helpers/serverSidePropsHelper'
import { processMetadata } from '@/utils/fetchPageMetadata'

const SECTION_CONFIG = {
    nearby: {
        restaurantType: 'nearby',
        titleKey: 'Nearby Restaurants',
        sectionTitleKey: 'Nearby',
        showTabs: false,
    },
    offers: {
        restaurantType: 'latest',
        filterData: { filterBy: { discounted: true } },
        titleKey: 'Offers',
        sectionTitleKey: 'Offers',
        showTabs: true,
    },
    'top-rated': {
        restaurantType: 'latest',
        filterData: { filterBy: { popular: true } },
        titleKey: 'Top Rated Restaurants',
        sectionTitleKey: 'Top Rated',
        showTabs: true,
    },
    'free-delivery': {
        restaurantType: 'latest',
        filterData: {
            filterBy: { freeDelivery: true },
            filterBy_list: ['free_delivery'],
        },
        titleKey: 'Free Delivery Restaurants',
        sectionTitleKey: 'Free Delivery',
        showTabs: false,
    },
}

const HomeSectionPage = ({
    configData,
    landingPageData,
    pathName,
    metaData,
    routeSection,
}) => {
    const { t } = useTranslation()
    const section = SECTION_CONFIG[routeSection]

    const title = `${t(section.titleKey)} on ${configData?.business_name}`

    const metadata = processMetadata(metaData, {
        title,
        description: '',
        image: `${configData?.base_urls?.react_landing_page_images}/${landingPageData?.banner_section_full?.banner_section_img_full}`,
    })

    return (
        <div className="div">
            <Meta
                title={metadata.title}
                description={metadata.description}
                ogImage={metadata.image}
                pathName={pathName}
                robotsMeta={metadata.robotsMeta}
            />
            <NoSsr>
                <TypeWiseRestaurant
                    key={routeSection}
                    restaurantType={section.restaurantType}
                    filterData={section.filterData}
                    sectionTitle={t(section.sectionTitleKey)}
                    showTabs={section.showTabs}
                    routeSection={routeSection}
                />
            </NoSsr>
        </div>
    )
}

HomeSectionPage.getLayout = (page) => <HomeGuard>{page}</HomeGuard>

export default HomeSectionPage

export const getServerSideProps = async (context) => {
    const { params } = context
    const slugSegments = Array.isArray(params?.slug) ? params.slug : []

    if (slugSegments.length !== 1 || !SECTION_CONFIG[slugSegments[0]]) {
        return { notFound: true }
    }

    const routeSection = slugSegments[0]
    const baseProps = await getCommonServerSideProps(
        context,
        `${routeSection.replace(/-/g, '_')}_foods`
    )

    return {
        props: {
            ...baseProps.props,
            routeSection,
        },
    }
}
