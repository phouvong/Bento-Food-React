export const handleInitialTotalPriceVarPriceQuantitySet = (
    product,
    setModalData,
    productUpdate,
    setTotalPrice,
    setQuantity,
    setSelectedOptions
) => {
    setModalData([product])
    if (productUpdate) {
        setTotalPrice(product.totalPrice)
    } else {
        setTotalPrice(product?.price)
    }
    if (product?.quantity) {
        setQuantity(product?.quantity)
    } else {
        setQuantity(1)
    }
    let selectedOption = []
    if (product?.variations?.length > 0) {
        product?.variations?.forEach((item) => {
            if (item?.values?.length > 0) {
                item?.values?.forEach((value) => {
                    if (value?.isSelected) {
                        selectedOption.push(value)
                    }
                })
            }
        })
    }
    if (productUpdate) {
        setSelectedOptions(product?.selectedOptions)
    } else {
        if (selectedOption.length > 0) {
            setSelectedOptions(selectedOption)
        } else {
            setSelectedOptions([])
        }
    }
}
