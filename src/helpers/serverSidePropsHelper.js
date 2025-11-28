import { landingPageApi } from '@/components/landingpage/Api'
import { fetchPageMetadata } from '@/utils/fetchPageMetadata'

/**
 * Fetch common server-side props including config, landing page data, and metadata
 * @param {Object} context - Next.js context object
 * @param {string} pageName - Page name for metadata API (e.g., 'vendor_list', 'category_list')
 * @param {string|number} pageId - Optional page ID for specific items
 * @returns {Promise<Object>} - Props object for the page
 */
export const getCommonServerSideProps = async (context, pageName, pageId = null) => {
    const { req, resolvedUrl, query } = context
    const language = req.cookies.languageSetting
    const domain = req.headers.host
    const pathName = 'https://' + domain + resolvedUrl
    
    // Extract ID from query if not provided
    const id = pageId || query?.id
    
    // Fetch config data
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
    const config = await configRes.json()
    
    // Fetch landing page data
    const landingPageData = await landingPageApi.getLandingPageImages()
    
    // Fetch dynamic metadata
    const metaData = await fetchPageMetadata(pageName, id, language)
    console.log({metaData});
    
    
    return {
        props: {
            configData: config,
            landingPageData: landingPageData.data,
            pathName: pathName,
            metaData: metaData,
        },
    }
}
