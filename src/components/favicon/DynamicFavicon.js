import React from 'react'
import Head from 'next/head'
import {useSelector} from "react-redux";
const DynamicFavicon = (props) => {
    const { global } = useSelector((state) => state.globalSettings)
    const businessLogo = global?.base_urls?.business_logo_url

    return (
        <Head>
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href={global?.fav_icon_full_url}
            />
            <link rel="icon" href={global?.fav_icon_full_url} />
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href={global?.fav_icon_full_url}
            />
            <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href={global?.fav_icon_full_url}
            />
        </Head>
    )
}

DynamicFavicon.propTypes = {}

export default DynamicFavicon
