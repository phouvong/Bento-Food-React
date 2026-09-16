import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import FeedBackSvg from '@/components/rate-and-review/FeedBackSvg'
import { OrderApi } from '@/hooks/react-query/config/orderApi'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import 'simplebar-react/dist/simplebar.min.css'
import DeliverymanForm from './DeliverymanForm'
import GroupButtonsRateAndReview from './GroupButtonsRateAndReview'
import ItemForm from './ItemForm'
import Shimmer from './Shimmer'

const dedupeReviewItemsByFood = (details) => {
    if (!Array.isArray(details)) return details
    const seen = new Set()
    return details.filter((detail) => {
        const foodId = detail?.food_id ?? detail?.id
        if (foodId == null) return true
        if (seen.has(foodId)) return false
        seen.add(foodId)
        return true
    })
}

const NothingToReview = () => {
    const { t } = useTranslation()
    return (
        <Stack width="100%" alignItems="center" justifyContent="center" py={4}>
            <Typography
                fontSize="14px"
                fontWeight={500}
                textAlign="center"
                color={(theme) => theme.palette.text.secondary}
            >
                {t('Nothing to review')}
            </Typography>
        </Stack>
    )
}

const RateAndReview = ({
    id,
    onClose,
    refetchTrackData,
    is_reviewed,
    is_dm_reviewed,
    refetchOrderDetails,
}) => {
    const { deliveryManInfo } = useSelector((state) => state.searchFilterStore)
    const [type, setType] = useState('items')
    const [reviewItems, setReviewItems] = useState(null)
    const [completeReview, setCompleteReview] = useState(false)
    const [reviewedItem, setReviewedItem] = useState()
    const {
        isFetching,
        data,
        refetch: refetchOrderReview,
    } = useQuery(['order-review', id], () => OrderApi.orderReview(id))

    useEffect(() => {
        id && refetchOrderReview()
    }, [id])

    useEffect(() => {
        setReviewItems(dedupeReviewItemsByFood(data?.data?.details))
    }, [data])

    const notNow = (reviewId) => {
        const tempData = reviewItems?.filter(
            (review) => review?.id !== reviewId
        )
        setReviewItems(tempData)
    }

    useEffect(() => {
        if (!reviewedItem) return
        const tempData = reviewItems?.filter(
            (review) => review?.food_id !== reviewedItem?.food_id
        )
        setReviewItems(tempData)
    }, [reviewedItem])
    useEffect(() => {
        if (reviewItems?.length === 0 && is_dm_reviewed) {
            setCompleteReview(true)
        }
    }, [reviewItems, is_dm_reviewed])

    useEffect(() => {
        if (is_reviewed && completeReview && is_dm_reviewed) {
            CustomToaster(
                'success',
                'Thanks For Your Feedback!',
                'If you want to order more items please explore our site.',
                <FeedBackSvg />,
                false,
                true
            )
        } else if (is_reviewed && completeReview) {
            CustomToaster(
                'success',
                'Thanks For Your Feedback!',
                'If you want to order more items please explore our site.',
                <FeedBackSvg />,
                false,
                true
            )
        }
    }, [completeReview, is_dm_reviewed, is_reviewed])
    useEffect(() => {
        if (is_reviewed || reviewItems?.length === 0) {
            setType('delivery_man')
        } else {
            if (is_dm_reviewed || !deliveryManInfo) {
                setType('items')
            }
        }
    }, [is_reviewed, is_dm_reviewed, reviewItems, deliveryManInfo])

    return (
        <CustomStackFullWidth
            alignItems="center"
            justifyContent="center"
            spacing={2}
            mt="9rem"
            mb="2rem"
        >
            {deliveryManInfo && (
                <GroupButtonsRateAndReview
                    deliveryManInfo={deliveryManInfo}
                    reviewItemsIsEmpty={reviewItems}
                    is_dm_reviewed={is_dm_reviewed}
                    is_reviewed={is_reviewed}
                    setType={setType}
                    type={type}
                />
            )}
            <CustomStackFullWidth
                alignItems="center"
                justifyContent="center"
                spacing={3}
            >
                {type === 'items' ? (
                    isFetching ? (
                        <Shimmer />
                    ) : reviewItems?.length > 0 ? (
                        reviewItems?.map((item, index) => (
                            <CustomPaperBigCard
                                key={item?.food_id ?? item?.id ?? index}
                            >
                                <ItemForm
                                    data={item}
                                    id={id}
                                    notNow={notNow}
                                    refetchOrderReview={refetchOrderReview}
                                    refetchTrackData={refetchTrackData}
                                    setReviewedItem={setReviewedItem}
                                    refetchOrderDetails={refetchOrderDetails}
                                />
                            </CustomPaperBigCard>
                        ))
                    ) : (
                        <NothingToReview />
                    )
                ) : !is_dm_reviewed && deliveryManInfo ? (
                    <CustomPaperBigCard>
                        <DeliverymanForm
                            onClose={onClose}
                            data={deliveryManInfo}
                            orderId={id}
                            refetchTrackData={refetchTrackData}
                            refetchOrderDetails={refetchOrderDetails}
                        />
                    </CustomPaperBigCard>
                ) : (
                    <NothingToReview />
                )}
            </CustomStackFullWidth>
        </CustomStackFullWidth>
    )
}

export default RateAndReview
