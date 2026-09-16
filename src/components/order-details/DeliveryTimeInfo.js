import {
    CustomColouredTypography,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import deliverymangif from '../../../public/static/animation.gif'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { Stack, Typography } from '@mui/material'
import moment from 'moment'
import { useTheme } from '@mui/material/styles'
import { normalizeOrderEta } from './orderEta'

const DeliveryTimeInfo = ({ trackData }) => {
    const theme = useTheme()
    const { t } = useTranslation()
    const today = moment(new Date())
    const orderPendingTime = deliverymangif
    // Server-calculated ETA (zone eta_configurations) wins; the legacy
    // client-side guess below only covers backends without it.
    const eta = normalizeOrderEta(trackData?.data)

    const differenceInMinutes = () => {
        const deliveryTime = trackData?.data?.restaurant?.delivery_time
        const createdAt = trackData?.data?.created_at
        const processingTime = trackData?.data?.processing_time
        const scheduleAt = trackData?.data?.schedule_at
        let minTime = processingTime != null ? processingTime : 0
        if (
            deliveryTime !== null &&
            deliveryTime !== '' &&
            processingTime === null
        ) {
            const timeArr = deliveryTime.split('-')
            minTime = Number.parseInt(timeArr[0])
        }
        const newDeliveryTime = scheduleAt ? scheduleAt : createdAt
        const newDeliveryTimeWithAdditionalMin = moment(newDeliveryTime)
            .add(minTime, 'minutes')
            .format()
        const duration = moment.duration(
            today.diff(newDeliveryTimeWithAdditionalMin)
        )
        const minutes = duration.asMinutes()
        if (minutes <= -1) {
            return Number.parseInt(Math.abs(minutes))
        }
    }
    const handleTime = () => {
        if (differenceInMinutes() > 5) {
            return `${differenceInMinutes() - 5} - ${differenceInMinutes()} `
        } else {
            return `1-5`
        }
    }
    return (
        <CustomStackFullWidth alignItems="center" justifyContent="center">
            <Stack>
                <Image
                    src={orderPendingTime}
                    alt="my gif"
                    height={150}
                    width={250}
                    objectFit="cover"
                />
            </Stack>

            <Stack alignItems="center" justifyContent="center" mt="1.5rem">
                <Typography
                    sx={{ fontSize: { xs: '14px', md: '16px' } }}
                    color={theme.palette.neutral[1000]}
                >
                    {t('Your food will be delivered within')}
                </Typography>
            </Stack>
            {trackData &&
                (eta?.window ? (
                    // Server ETA clock window is the delivery time —
                    // rendered verbatim (already in the panel's timezone).
                    <Stack alignItems="center" spacing={0.25}>
                        {Boolean(Number(trackData?.data?.scheduled)) &&
                            trackData?.data?.schedule_at && (
                                // Scheduled deliveries can land on another
                                // day, so the clock window alone is
                                // ambiguous — show the slot's date.
                                <Typography
                                    sx={{
                                        fontSize: { xs: '13px', md: '15px' },
                                        color: theme.palette.neutral[500],
                                    }}
                                >
                                    {moment(
                                        trackData?.data?.schedule_at
                                    ).format('ddd, D MMM YYYY')}
                                </Typography>
                            )}
                        <CustomColouredTypography
                            color="primary"
                            sx={{
                                fontSize: { xs: '18px', md: '26px' },
                                fontWeight: '700',
                            }}
                        >
                            {eta.window}
                        </CustomColouredTypography>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={0.5}>
                        <Typography
                            sx={{
                                fontSize: {
                                    xs: '14px',
                                    md: '26px',
                                    fontWeight: '700',
                                },
                            }}
                        >
                            {eta
                                ? `${eta.minMinutes}-${eta.maxMinutes}`
                                : handleTime()}
                        </Typography>
                        <CustomColouredTypography
                            color="primary"
                            sx={{
                                fontSize: { xs: '14px', md: '26px' },
                                fontWeight: '700',
                            }}
                        >
                            {t('mins')}
                        </CustomColouredTypography>
                    </Stack>
                ))}
        </CustomStackFullWidth>
    )
}

export default DeliveryTimeInfo
