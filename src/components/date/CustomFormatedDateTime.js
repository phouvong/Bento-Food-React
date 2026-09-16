import moment from 'moment/moment'
import { store } from '@/redux/store'

const CustomFormatedDateTime = ({ date }) => {
    const global = store.getState()?.globalSettings?.global
    let timeFormat = global?.timeformat

    if (timeFormat === '12') {
        return moment(date).format('ll hh:mm a')
    } else {
        return moment(date).format('ll HH:mm')
    }
}

export default CustomFormatedDateTime
