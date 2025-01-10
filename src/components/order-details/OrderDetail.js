import React from 'react';
import OrderDetails from './OrderDetails';
import PushNotificationLayout from "../PushNotificationLayout";
import { useSelector } from "react-redux";

const OrderDetail = ({orderId}) => {
    const { guestUserInfo } = useSelector((state) => state.guestUserInfo);

    return (
        <PushNotificationLayout>
            <OrderDetails phone={guestUserInfo?.contact_person_number} OrderIdDigital={orderId}/>
        </PushNotificationLayout>
    );
};

export default OrderDetail;