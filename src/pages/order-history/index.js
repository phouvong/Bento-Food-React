import React from 'react'
import OrderHistory from '../../components/order-history/OrderHistory'
import Meta from '../../components/Meta'
import AuthGuard from '../../components/authentication/AuthGuard'
import PushNotificationLayout from '../../components/PushNotificationLayout'
import { getServerSideProps } from '../index'
const OrderLayout = ({ configData }) => {
    return (
        <>
            <div className="div">
                <Meta title={`My Orders - ${configData?.business_name}`} />

                <PushNotificationLayout>
                    <OrderHistory />
                </PushNotificationLayout>
            </div>
        </>
    )
}
OrderLayout.getLayout = (page) => <AuthGuard>{page}</AuthGuard>
export default OrderLayout
export { getServerSideProps }
