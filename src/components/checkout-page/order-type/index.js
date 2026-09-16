import React from 'react'
import { Stack, Typography } from '@mui/material'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import SegmentedToggle from '../shared/SegmentedToggle'
import { orderTypes } from './data'
import { ACTIONS } from '../states'

const OrderType = (props) => {
    const {
        t,
        subscriptionStates,
        subscriptionDispatch,
        setDeliveryTip,
        setPaymenMethod,
        setPaymentMethodDetails,
        setUsePartialPayment,
        setSwitchToWallet,
        setOrderType,
        order_subscription_active,
    } = props

    const visibleOrderTypes = orderTypes?.filter((item) => {
        if (item?.name === 'Subscription Order') {
            return order_subscription_active
        }
        return true
    })

    // Only one order type available (repeat order not offered by this
    // restaurant) — there is nothing to choose between, so the whole
    // section is hidden rather than showing a single, meaningless pill.
    if (!visibleOrderTypes || visibleOrderTypes.length < 2) {
        return null
    }

    const handleChange = (value) => {
        const item = orderTypes.find((option) => option.value === value)
        if (item?.name === 'Subscription Order') {
            setDeliveryTip(0)
            setPaymentMethodDetails({ name: '', image: '' })
            setPaymenMethod('')
            setUsePartialPayment(false)
            setSwitchToWallet(false)
            setOrderType('delivery')
        }
        subscriptionDispatch({
            type: ACTIONS.setSubscriptionOrder,
            payload: value,
        })
    }

    const toggleOptions = visibleOrderTypes.map((item) => ({
        value: item.value,
        label: t(
            item?.name === 'Subscription Order' ? 'Repeat Order' : item?.name
        ),
    }))

    return (
        <CustomStackFullWidth>
            <Stack
                direction="row"
                alignItems="center"
                sx={{
                    width: '100%',
                    gap: '20px',
                    padding: '12px',
                    borderRadius: '16px',
                    backgroundColor: 'background.paper',
                }}
            >
                <Typography
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        flex: 1,
                        minWidth: 0,
                        pl: '8px',
                        fontSize: '18px',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        letterSpacing: '-0.54px',
                        color: 'text.primary',
                    }}
                >
                    {t('Choose Order Type')}
                </Typography>
                <SegmentedToggle
                    value={subscriptionStates.order}
                    onChange={handleChange}
                    options={toggleOptions}
                />
            </Stack>
        </CustomStackFullWidth>
    )
}

OrderType.propTypes = {}

export default OrderType
