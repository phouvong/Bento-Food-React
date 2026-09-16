import React from 'react'
import dynamic from 'next/dynamic'
import { useDispatch, useSelector } from 'react-redux'

import { RTL } from '@/components/RTL/RTL'
import { handleBadge } from '@/utils/customFunctions'
import { closeSearchProductModal } from '@/redux/slices/searchProductModal'

const FoodDetailModal = dynamic(() =>
    import('@/components/foodDetail-modal/FoodDetailModal')
)

const SearchProductModal = () => {
    const dispatch = useDispatch()
    const { global } = useSelector((state) => state.globalSettings)
    const { isOpen, selectedItem } = useSelector(
        (state) => state.searchProductModal
    )

    const handleModalClose = () => dispatch(closeSearchProductModal())

    if (!isOpen || !selectedItem?.id) return null

    const languageDirection =
        typeof window !== 'undefined'
            ? localStorage.getItem('direction')
            : 'ltr'

    return (
        <RTL direction={languageDirection}>
            <FoodDetailModal
                product={selectedItem}
                image={selectedItem?.image_full_url}
                open={isOpen}
                handleModalClose={handleModalClose}
                setOpen={(value) => {
                    if (!value) handleModalClose()
                }}
                currencySymbolDirection={global?.currency_symbol_direction}
                currencySymbol={global?.currency_symbol}
                digitAfterDecimalPoint={global?.digit_after_decimal_point}
                handleBadge={handleBadge}
            />
        </RTL>
    )
}

export default SearchProductModal
