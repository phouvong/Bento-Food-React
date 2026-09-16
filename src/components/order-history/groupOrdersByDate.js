import moment from 'moment'

// Buckets orders by the calendar day of `created_at`, preserving the
// order the API returned them in (each group's `orders` stays in original
// sequence; groups appear in first-seen order).
export const groupOrdersByDate = (orders = []) => {
    const groups = []
    const groupsByKey = new Map()

    orders.forEach((order) => {
        const key = order?.created_at
            ? moment(order.created_at).format('YYYY-MM-DD')
            : 'unknown'
        if (!groupsByKey.has(key)) {
            const group = { key, orders: [] }
            groupsByKey.set(key, group)
            groups.push(group)
        }
        groupsByKey.get(key).orders.push(order)
    })

    return groups
}

// "Today" / "Yesterday" for the two most recent days, otherwise a plain
// date — mirrors the day-grouping convention from the Figma redesign.
export const formatOrderGroupLabel = (key, t) => {
    if (key === 'unknown') return t('Unknown date')
    const date = moment(key)
    if (date.isSame(moment(), 'day')) return t('Today')
    if (date.isSame(moment().subtract(1, 'day'), 'day')) return t('Yesterday')
    return date.format('D MMM YYYY')
}
