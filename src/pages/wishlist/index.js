import React from 'react'
import WishList from '../../components/wishlist-page/WishList'
import Meta from '../../components/Meta'
import PushNotificationLayout from '../../components/PushNotificationLayout'
import { CustomHeader } from '@/api/Headers'

const index = ({ configData }) => {
    return (
        <div className="div">
            <Meta title={`My Wish list - ${configData?.business_name}`} />

            <PushNotificationLayout>
                <WishList />
            </PushNotificationLayout>
        </div>
    )
}

export default index
export const getServerSideProps = async () => {
    const configRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/config`,
        {
            method: 'GET',
            headers: CustomHeader,
        }
    )
    const config = await configRes.json()
    return {
        props: {
            configData: config,
        },
    }
}
