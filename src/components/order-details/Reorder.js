import React, { useEffect } from 'react'
import { PrimaryButton } from '../products-page/FoodOrRestaurant'
import { t } from 'i18next'
import { useMutation } from 'react-query'
import { OrderApi } from '@/hooks/react-query/config/orderApi'
import { onErrorResponse } from '../ErrorResponse'
import useReorderFlow from '@/hooks/react-query/reorder/useReorderFlow'

const Reorder = ({ orderData }) => {
    const { data, mutate, isLoading } = useMutation(
        'food-lists',
        OrderApi.foodLists
    )

    // Pre-warm the food-list cache as soon as we have orderData. The actual
    // reorder runs through `useReorderFlow` on click — this `mutate` exists
    // only to flip the button out of its `disabled={!data}` state once the
    // food list is ready.
    useEffect(() => {
        if (!orderData?.length) return
        const foodIds = JSON.stringify(
            orderData.map((item) => item?.food_id)
        )
        mutate(foodIds, { onError: onErrorResponse })
    }, [orderData])

    const { triggerReorder, isWorking } = useReorderFlow()

    const handleClick = () => {
        triggerReorder({ orderData })
    }

    return (
        <PrimaryButton
            variant="contained"
            onClick={handleClick}
            disabled={!data || isLoading || isWorking}
        >
            {t('Reorder')}
        </PrimaryButton>
    )
}

export default Reorder
