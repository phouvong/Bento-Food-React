import CustomFormatedDateTime from '@/components/date/CustomFormatedDateTime'

export const formatBogoValidUntil = (offer) =>
    offer?.end_date
        ? CustomFormatedDateTime({ date: offer.end_date })
        : offer?.valid_until
