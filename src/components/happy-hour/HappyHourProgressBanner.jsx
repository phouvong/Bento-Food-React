import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ProgressBarTimer from '@/components/happy-hour/ProgressBarTimer'
import { getAmount } from '@/utils/customFunctions'

const HappyHourProgressBanner = ({
    expireAt,
    windowMinutes,
    remainingAmount,
    discountPercent,
    amountProgress = null,
    flushBottom = false,
}) => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)

    return (
        <ProgressBarTimer
            expireAt={expireAt}
            durationInMinutes={windowMinutes}
            progress={amountProgress}
            showProgress={amountProgress !== null}
            flushBottom={flushBottom}
        >
            {remainingAmount > 0 ? (
                <>
                    {t('Add')}{' '}
                    <strong>
                        {getAmount(
                            remainingAmount,
                            global?.currency_symbol_direction,
                            global?.currency_symbol,
                            global?.digit_after_decimal_point
                        )}
                    </strong>{' '}
                    {t('more to get')}{' '}
                    <strong>
                        {discountPercent}% {t('Off')}
                    </strong>
                </>
            ) : amountProgress === null ? (
                <>
                    {t('Order now & get')}{' '}
                    <strong>
                        {discountPercent}% {t('Off')}
                    </strong>
                </>
            ) : (
                <>
                    {t('You are getting')}{' '}
                    <strong>
                        {discountPercent}% {t('Off')}
                    </strong>
                </>
            )}
        </ProgressBarTimer>
    )
}

export default HappyHourProgressBanner
