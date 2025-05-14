import React, { useEffect, useState } from 'react'
import 'firebase/messaging'
import { useStoreFcm } from '@/hooks/react-query/push-notification/usePushNotification'
import { onMessageListener, fetchToken } from '@/firebase'
import { toast } from 'react-hot-toast'
import { Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'

const PushNotificationLayout = ({ children, refetch, pathName }) => {
    const router = useRouter()
    const [notification, setNotification] = useState(null)
    const [fcmToken, setFcmToken] = useState('')

    useEffect(() => {
        fetchToken(setFcmToken).then()
    }, [])
    let token = undefined
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token')
    }

    const { mutate } = useStoreFcm()

    useEffect(() => {
        if (token) {
            mutate(fcmToken)
        }
    }, [fcmToken])

    const clickHandler = () => {
        if (notification.type === 'message') {
            router.push({
                pathname: '/info',
                query: {
                    conversationId: notification?.conversation_id,
                    type: notification.sender_type,
                    chatFrom: 'true',
                    page: 'inbox',
                },
            })
        } else if (notification.type === 'order_status') {
            router.push(
                {
                    pathname: '/info',
                    query: { page: 'order', orderId: notification.order_id },
                },
                undefined,
                { shallow: true }
            )
        }
    }

    useEffect(() => {
        onMessageListener()
            .then((payload) => {
                setNotification(payload.data)
            })
            .catch((err) => toast(err))
        if (notification) {
            if (pathName === 'info' && notification.type === 'message') {
                refetch()
            } else {
                toast(
                    <>
                        <Stack
                            sx={{ cursor: 'pointer' }}
                            onClick={clickHandler}
                        >
                            <Typography>{notification.title}</Typography>
                            <Typography>{notification.body}</Typography>
                        </Stack>
                    </>
                )
            }
        }
    }, [notification])

    return <>{children}</>
}

export default PushNotificationLayout
