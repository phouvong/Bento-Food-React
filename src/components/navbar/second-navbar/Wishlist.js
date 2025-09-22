import React from 'react'
import { Badge, IconButton } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { useSelector } from 'react-redux'

const Wishlist = ({ handleClick }) => {
    const { wishLists } = useSelector((state) => state.wishList)
    return (
        <IconButton onClick={() => handleClick('wishlist')}>
            <Badge
                color="primary"
                variant="dot"
                overlap="circular"
                invisible={
                    wishLists === undefined ||
                    (wishLists?.food?.length === 0 &&
                        wishLists.restaurant.length === 0)
                }
            >
                <FavoriteBorderIcon color="primary" />
            </Badge>
        </IconButton>
    )
}

export default Wishlist
