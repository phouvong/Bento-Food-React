import moment from "moment";


const isRestaurantOpen = (restaurantSchedule,dayNumber, selectedTime)=>{
    let isOpen = false
    if(restaurantSchedule?.length>0){
        restaurantSchedule?.forEach(rest=> {
            if(rest?.day===dayNumber){
                const startTime = moment(rest?.opening_time, 'HH:mm:ss')
                const endTime = moment(rest?.closing_time, 'HH:mm:ss')
                const currentTime = moment(selectedTime,'HH:mm:ss' )
                isOpen= moment(currentTime).isBetween(startTime, endTime)
            }
        })
    }
    return isOpen
}

// isRestaurantOpen only compares time-of-day against the weekly schedule —
// it has no idea whether the *specific calendar date* it's being checked
// against has already gone by (e.g. picking today's date with a time
// earlier than right now). Filter those out separately so a stale
// selection never gets counted as a deliverable occurrence.
const isNotInThePast = (candidateDate, selectedTime) => {
    if (!selectedTime) return false
    const candidate = moment(
        `${moment(candidateDate).format('YYYY-MM-DD')} ${selectedTime}`,
        'YYYY-MM-DD HH:mm:ss'
    )
    return candidate.isAfter(moment())
}
export const getSubscriptionOrderCount = (restaurantSchedule, type, startDate, endDate,days)=>{
    let start_date = moment(startDate);
    let end_date = moment(endDate);
    let startingDate = start_date;
    let count =0
    let dayCount = 0
    if(type==='daily') {
        while(startingDate <= end_date) {
            const dayNumber = moment(startingDate).day()
            if(
                isRestaurantOpen(restaurantSchedule,dayNumber,days[0]?.time ) &&
                isNotInThePast(startingDate, days[0]?.time)
            ){
                count++
            }
            dayCount++
            startingDate.add(1, 'days');
        }
    }
    else if(type==='weekly'){
        while(startingDate <= end_date) {
            const dayNumber = moment(startingDate).day()
            if(days.length>0){
                days.forEach(item=> {
                    if(item?.day===dayNumber){
                        if(
                            isRestaurantOpen(restaurantSchedule,dayNumber,item?.time ) &&
                            isNotInThePast(startingDate, item?.time)
                        ){
                            count++
                        }
                    }
                })
            }
            startingDate.add(1, 'days');
        }
    }
    else if(type==='monthly'){
        while(startingDate <= end_date) {
            const dayNumber = moment(startingDate).day()
            const dayNumberFromMonth = moment(startingDate).format('D')
            if(days.length>0){
                days.forEach(item=>{
                    if(Number.parseInt(item?.day)===Number.parseInt(dayNumberFromMonth)){
                        if(
                            isRestaurantOpen(restaurantSchedule,dayNumber,item?.time ) &&
                            isNotInThePast(startingDate, item?.time)
                        ){
                            count++
                        }
                    }
                })
            }
            dayCount++
            startingDate.add(1, 'days');
        }
    }
    return count

}