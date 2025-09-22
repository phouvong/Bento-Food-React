import { handleValuesFromCartItems } from '../checkout-page/CheckoutPage'

export const getItemDataForAddToCart = (
    values,
    updateQuantity,
    mainPrice,
    guest_id
) => {
    let totalQty = 0
    return {
        guest_id: guest_id,
        cart_id: values?.cartItemId,
        model: values?.available_date_starts ? 'ItemCampaign' : 'Item',
        add_on_ids:
            values?.add_ons?.length > 0
                ? values?.addons?.map((add) => {
                      return add.id
                  })
                : [],
        add_on_qtys:
            values?.add_ons?.length > 0
                ? values?.addons?.map((add) => {
                      totalQty = add.quantity
                      return totalQty
                  })
                : [],
        item_id: values?.id,
        price: mainPrice,
        quantity: updateQuantity,
        variation_options: []?.concat(
            ...(values?.variations?.length > 0
                ? values?.variations?.map((variation) => {
                      return variation.values
                          ?.filter((item) => item.isSelected)
                          ?.map((item) => item.option_id)
                  })
                : [])
        ),
        variations:
            values?.variations?.length > 0
                ? values?.variations?.map((variation) => {
                      return {
                          name: variation.name,
                          values: {
                              label: handleValuesFromCartItems(
                                  variation.values
                              ),
                          },
                      }
                  })
                : [],
    }
}
