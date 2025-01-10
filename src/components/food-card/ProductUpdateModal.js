import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RTL } from '../RTL/RTL'
import dynamic from 'next/dynamic'
const FoodDetailModal = dynamic(() =>
    import('../foodDetail-modal/FoodDetailModal')
)

const ProductUpdateModal = ({
    openModal,
    setOpenModal,
    currencySymbol,
    currencySymbolDirection,
    digitAfterDecimalPoint,
    handleBadge,
}) => {
    const [product, setProduct] = useState(null)
    const [languageDirection, setLanguageDirection] = useState('')
    const { cartItem } = useSelector((state) => state.cart)
    const { global } = useSelector((state) => state.globalSettings)
    useEffect(() => {
        setProduct({
            ...cartItem,
            add_ons: cartItem?.addons,
            cart_id: cartItem?.cartItemId,
        })
    }, [])
    const handleModalClose = () => {
        setOpenModal(false)
    }
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setLanguageDirection(localStorage.getItem('direction') || 'ltr')
        }
    }, [languageDirection])
    return (
        <>
            {product && openModal && (
                <RTL direction={languageDirection}>
                    <FoodDetailModal
                        product={product}
                        image={`${global?.base_urls?.product_image_url}/${product.image}`}
                        open={openModal}
                        handleModalClose={handleModalClose}
                        setOpen={setOpenModal}
                        currencySymbolDirection={currencySymbolDirection}
                        currencySymbol={currencySymbol}
                        digitAfterDecimalPoint={digitAfterDecimalPoint}
                        productUpdate={true}
                        handleBadge={handleBadge}
                    />
                </RTL>
            )}
        </>
    )
}

ProductUpdateModal.propTypes = {}

export default ProductUpdateModal
