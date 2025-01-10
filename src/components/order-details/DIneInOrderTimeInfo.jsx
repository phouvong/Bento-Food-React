import React from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import deliverymangif from '../../../public/static/animation.gif'
import cookingGif from '../../../public/static/AnimationCom.gif'
import cookedGif from '../../../public/static/cookeddddd.gif'
import deliveriedGif from '../../../public/static/deliveiredGif.gif'
import newCookGif from '../../../public/static/cooking.gif'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Stack, Typography } from '@mui/material'
import moment from 'moment'
import { useTheme } from '@mui/material/styles'

const DIneInOrderTimeInfo = ({ trackData }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const today = moment(new Date())
    const scheduleAt = trackData?.data?.schedule_at
    const scheduleDate = new Date(scheduleAt)
    const isGreater = today > scheduleDate
    function formatDuration(minutes) {
        const duration = moment.duration(minutes, 'minutes')
        if (minutes < 60) {
            return `${minutes} mins`
        } else if (minutes < 1440) {
            // Less than a day
            const hours = duration.hours()
            const mins = duration.minutes()
            return `${hours} hr${hours > 1 ? 's' : ''} ${
                mins ? `${mins} ` : 'mins'
            }`
        } else {
            const days = duration.days()
            const hours = duration.hours()
            return `${days} day${days > 1 ? 's' : ''} ${
                hours ? `${hours} hr${hours > 1 ? 's' : ''}` : ''
            }`
        }
    }

    const differenceInMinutes = () => {
        const deliveryTime = trackData?.data?.restaurant?.delivery_time
        const createdAt = trackData?.data?.created_at
        const processingTime = trackData?.data?.processing_time
        let minTime = processingTime != null ? processingTime : 0
        if (
            deliveryTime !== null &&
            deliveryTime !== '' &&
            processingTime === null
        ) {
            const timeArr = deliveryTime.split('-')
            minTime = Number.parseInt(timeArr[0])
        }

        const newDeliveryTime =
            trackData?.data?.processing &&
            trackData?.data?.order_status === 'processing'
                ? trackData?.data?.processing
                : scheduleAt
                ? scheduleAt
                : createdAt
        const newDeliveryTimeWithAdditionalMin = moment(newDeliveryTime)
            .add(minTime, 'minutes')
            .format()
        const duration = moment.duration(
            today.diff(newDeliveryTimeWithAdditionalMin)
        )
        const minutes = duration.asMinutes()
        //here minutes give negative values for positive changes, that's why the condition given below
        if (minutes <= -1) {
            return Number.parseInt(Math.abs(minutes))
        }
    }
    const handleTime = () => {
        const isP =
            trackData?.data?.order_status === 'handover'
                ? trackData?.data?.processing_time
                : 0
        if (differenceInMinutes() > 5) {
            const final_time =
                trackData?.data?.order_status === 'processing'
                    ? `${differenceInMinutes() - 5} - ${differenceInMinutes()}`
                    : ` ${formatDuration(differenceInMinutes() - isP)} `
            return final_time
        } else {
            return `1-5`
        }
    }

    const handleGIF = (actionType) => {
        switch (actionType) {
            case 'pending':
                return deliverymangif
            case 'confirmed':
                return cookingGif
            case 'processing':
                return newCookGif
            case 'cooking':
                return newCookGif
            case 'handover':
                return cookedGif
            case 'picked_up':
                return cookedGif
            case 'delivered':
                return deliveriedGif
            default:
                console.log('Invalid action')
                break
        }
    }
    const handleTitle = (actionType) => {
        switch (actionType) {
            case 'pending':
                return ``
            case 'confirmed':
                return `${t('Your Food is Confirmed')}`
            case 'processing':
                return `${t('Your Food is Cooking')}`
            case 'cooking':
                return `${t('Your Food is Cooking')}`
            case 'handover':
                return `${t('Your Food is ready !')}`
            case 'picked_up':
                return `${t('Your Food is ready !')}`
            case 'delivered':
                return `${t('Your Food is served  !')}`
            default:
                console.log('Invalid action')
                break
        }
    }
    const handleSubTitle = (actionType) => {
        switch (actionType) {
            case 'pending':
                return (
                    <Typography
                        sx={{ fontSize: { xs: '14px', md: '16px' } }}
                        color={theme.palette.neutral[1000]}
                        maxWidth="350px"
                        textAlign="center"
                        fontWeight="500"
                    >
                        {t(
                            'Your Order is Pending, Please Wait for Restaurant Confirmation'
                        )}
                    </Typography>
                )
            case 'confirmed':
                return (
                    <Typography
                        sx={{ fontSize: { xs: '14px', md: '16px' } }}
                        color={theme.palette.neutral[1000]}
                        maxWidth="450px"
                        textAlign="center"
                        fontWeight="400"
                    >
                        {`Your dine-in order is confirmed. Please make sure to arrive on time - `}
                        <Typography fontWeight="700">
                            {moment(
                                trackData?.data?.schedule_at,
                                'YYYY-MM-DD HH:mm:ss'
                            ).format('DD MMM, h:mma')}
                        </Typography>
                    </Typography>
                )
            case 'processing':
                return (
                    <Typography
                        sx={{ fontSize: { xs: '14px', md: '16px' } }}
                        color={theme.palette.neutral[1000]}
                        maxWidth="350px"
                        textAlign="center"
                        fontWeight="400"
                    >
                        {isGreater
                            ? t('Food is ready hurry up !')
                            : t(`You Food is almost ready !`)}

                        {isGreater ? null : (
                            <Typography fontSize="25px" fontWeight="700">
                                {handleTime()} mins
                            </Typography>
                        )}
                    </Typography>
                )
            case 'cooking':
                return (
                    <Typography
                        sx={{ fontSize: { xs: '14px', md: '16px' } }}
                        color={theme.palette.neutral[1000]}
                        maxWidth="350px"
                        textAlign="center"
                        fontWeight="400"
                    >
                        {t(`You Food is almost ready !`)}
                        {isGreater ? null : (
                            <Typography fontSize="25px" fontWeight="700">
                                {handleTime()} mins
                            </Typography>
                        )}
                    </Typography>
                )
            case 'handover':
                return (
                    <Typography
                        sx={{ fontSize: { xs: '14px', md: '16px' } }}
                        color={theme.palette.neutral[1000]}
                        maxWidth="350px"
                        textAlign="center"
                        fontWeight="400"
                    >
                        {t(`Your food is ready to serve. You are`)}
                        {isGreater ? null : (
                            <Typography fontSize="25px" fontWeight="700">
                                {handleTime()}
                            </Typography>
                        )}
                        <Typography fontSize="14px" fontWeight="400">
                            {t('away from restaurant. Hurry up !')}
                        </Typography>
                    </Typography>
                )
            case 'picked_up':
                return (
                    <Typography
                        sx={{ fontSize: { xs: '14px', md: '16px' } }}
                        color={theme.palette.neutral[1000]}
                        maxWidth="350px"
                        textAlign="center"
                        fontWeight="400"
                    >
                        {t('Your food is ready to serve.')}
                        {/*<Typography fontSize="25px" fontWeight="700">*/}
                        {/*    {`You are ${handleTime()} mins  away from restaurant. Hurry up !`}*/}
                        {/*</Typography>*/}
                    </Typography>
                )
            case 'delivered':
                return (
                    <Typography
                        sx={{ fontSize: { xs: '14px', md: '16px' } }}
                        color={theme.palette.neutral[1000]}
                        maxWidth="350px"
                        textAlign="center"
                        fontWeight="400"
                    >
                        {t('Enjoy your meal !')}
                    </Typography>
                )
            default:
                console.log('Invalid action')
                break
        }
    }

    return (
        <CustomStackFullWidth alignItems="center" justifyContent="center">
            <Typography
                sx={{
                    color: 'customColor.fifteen',
                    fontSize: '18px',
                    fontWeight: '600',
                }}
            >
                {' '}
                {t('Order')} # {trackData?.data?.id}
            </Typography>
            <Typography
                sx={{
                    color: (theme) => theme.palette.primary.main,
                    fontSize: '18px',
                    fontWeight: '600',
                }}
            >
                {handleTitle(trackData?.data?.order_status)}
            </Typography>

            <Stack marginTop="1rem">
                <Image
                    src={handleGIF(trackData?.data?.order_status)}
                    alt="my gif"
                    height={140}
                    width={200}
                    objectFit="cover"
                />
            </Stack>

            <Stack alignItems="center" justifyContent="center" mt="1.5rem">
                {handleSubTitle(trackData?.data?.order_status)}
            </Stack>
        </CustomStackFullWidth>
    )
}

export default DIneInOrderTimeInfo
