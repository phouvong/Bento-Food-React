import React from 'react'
import Head from 'next/head'

const Meta = ({ title, description, ogImage, pathName, robotsMeta }) => {
    // Build robots meta tag content from API data
    const buildRobotsContent = () => {
        if (!robotsMeta) {
            return 'index,follow'
        }

        const robotsArray = []

        // Handle indexing
        if (robotsMeta.meta_index === 0) robotsArray.push('noindex')
        else if (robotsMeta.meta_index === 1) robotsArray.push('index')

        // Handle other directives
        if (robotsMeta.meta_no_follow) robotsArray.push(robotsMeta.meta_no_follow)
        if (robotsMeta.meta_no_image_index) robotsArray.push(robotsMeta.meta_no_image_index)
        if (robotsMeta.meta_no_archive) robotsArray.push(robotsMeta.meta_no_archive)
        if (robotsMeta.meta_no_snippet) robotsArray.push(robotsMeta.meta_no_snippet)

        // Handle max-snippet
        if (robotsMeta.meta_max_snippet && robotsMeta.meta_max_snippet_value) {
            robotsArray.push(`max-snippet:${robotsMeta.meta_max_snippet_value}`)
        }

        // Handle max-video-preview
        if (robotsMeta.meta_max_video_preview && robotsMeta.meta_max_video_preview_value) {
            robotsArray.push(`max-video-preview:${robotsMeta.meta_max_video_preview_value}`)
        }

        // Handle max-image-preview
        if (robotsMeta.meta_max_image_preview && robotsMeta.meta_max_image_preview_value) {
            robotsArray.push(`max-image-preview:${robotsMeta.meta_max_image_preview_value}`)
        }

        return robotsArray.length > 0 ? robotsArray.join(', ') : 'index,follow'
    }

    const robotsContent = buildRobotsContent()
    console.log({ title });

    return (
        <Head>
            <title>{title}</title>
            {description && <meta name="description" content={description} />}
            <meta name="robots" content={robotsContent} />

            {/*<!-- Google / Search Engine Tags -->*/}
            <meta itemProp="name" content={title} />
            <meta itemProp="description" content={description} />
            <meta itemProp="image" content={ogImage} />
            <meta property="og:type" content="website" />

            {/*<!-- Facebook Meta Tags -->*/}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:type" content="image/jpg" />
            <meta property="og:image:width" content="1080" />
            <meta property="og:image:height" content="608" />
            <meta property="og:url" content={pathName} />
            <meta property="og:type" content="website" />

            {/*<!-- Twitter Meta Tags -->*/}
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:card" content="summary_large_image" />
        </Head>
    )
}

export default Meta
