import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import ProgressBarTimer from '@/components/happy-hour/ProgressBarTimer'
import { getAmount } from '@/utils/customFunctions'

const DiscountEligibilityBanner = ({
    percentage,
    shortfall,
    amountProgress,
    flushBottom = false,
}) => {
    const { t } = useTranslation()
    const { global } = useSelector((state) => state.globalSettings)

    return (
        <ProgressBarTimer
            hideTimer
            progress={amountProgress}
            showProgress={amountProgress !== null}
            flushBottom={flushBottom}
        >
            {shortfall > 0 ? (
                <>
                    {t('Add')}{' '}
                    <strong>
                        {getAmount(
                            shortfall,
                            global?.currency_symbol_direction,
                            global?.currency_symbol,
                            global?.digit_after_decimal_point
                        )}
                    </strong>{' '}
                    {t('more to get')}{' '}
                    <strong>
                        {percentage}% {t('Off')}
                    </strong>
                </>
            ) : (
                <>
                    {t('You are getting')}{' '}
                    <strong>
                        {percentage}% {t('Off')}
                    </strong>
                </>
            )}
        </ProgressBarTimer>
    )
}

export default DiscountEligibilityBanner
