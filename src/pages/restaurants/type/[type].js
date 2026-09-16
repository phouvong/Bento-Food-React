import React from 'react'
import { NoSsr } from '@mui/material'
import TypeWiseResturant from '../../../components/type-wise-restaurant-page/TypeWiseRestaurant'

const index = () => {
    return (
        <>
            <div className="div">
                <NoSsr>
                    <TypeWiseResturant />
                </NoSsr>
            </div>
        </>
    )
}

export default index
