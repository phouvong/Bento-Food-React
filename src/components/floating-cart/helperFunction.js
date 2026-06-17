import { handleValuesFromCartItems } from '../checkout-page/CheckoutPage'

export const getItemDataForAddToCart = (
    values,
    updateQuantity,
    mainPrice,
    guest_id
) => {
    // Drop zero-quantity add-ons so the API never sees an addon line with
    // qty 0 — the user effectively unselected it. `values.addons` (selected
    // set with quantities) is the canonical source; `values.add_ons` is just
    // the menu list used as a presence flag.
    const selectedAddons =
        values?.add_ons?.length > 0 && Array.isArray(values?.addons)
            ? values.addons.filter((add) => Number(add?.quantity) > 0)
            : []
    return {
        guest_id: guest_id,
        cart_id: values?.cartItemId,
        restaurant_id: values?.restaurant_id,
        model: values?.available_date_starts ? 'ItemCampaign' : 'Item',
        add_on_ids: selectedAddons.map((add) => add.id),
        add_on_qtys: selectedAddons.map((add) => add.quantity),
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
