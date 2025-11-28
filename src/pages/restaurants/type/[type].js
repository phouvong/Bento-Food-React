import React from 'react'
import { NoSsr } from '@mui/material'
import TypeWiseResturant from '../../../components/type-wise-resturant-page/TypeWiseResturant'

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
