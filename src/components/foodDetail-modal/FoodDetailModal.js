import { Grid, Modal, Tooltip, Typography, Stack } from '@mui/material'
import React, { useEffect, useState,useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { useWishListDelete } from '@/hooks/react-query/config/wish-list/useWishListDelete'
import { cart, setCampCart, setCart, setClearCart } from '@/redux/slices/cart'
import { addWishList, removeWishListFood } from '@/redux/slices/wishList'
import {
    calculateItemBasePrice,
    getConvertDiscount,
    handleProductValueWithOutDiscount,
    isAvailable,
} from '@/utils/customFunctions'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation } from 'react-query'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import AuthModal from '../auth'
import { FoodDetailModalStyle } from '../home/HomeStyle'
import CartClearModal from './CartClearModal'
import StartPriceView from './StartPriceView'

import AddOnsManager from './AddOnsManager'
import AddOrderToCart from './AddOrderToCart'
import AddUpdateOrderToCart from './AddUpdateOrderToCart'
import { handleProductVariationRequirementsToaster } from './SomeHelperFuctions'
import TotalAmountVisibility from './TotalAmountVisibility'
import UpdateToCartUi from './UpdateToCartUi'
import VariationsManager from './VariationsManager'

import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import HalalSvg from '@/components/food-card/HalalSvg'
import { useGetFoodDetails } from '@/hooks/react-query/food/useGetFoodDetails'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import useAddCartItem from '../../hooks/react-query/add-cart/useAddCartItem'
import useCartItemUpdate from '../../hooks/react-query/add-cart/useCartItemUpdate'
import useDeleteAllCartItem from '../../hooks/react-query/add-cart/useDeleteAllCartItem'
import { onErrorResponse } from '../ErrorResponse'
import { handleValuesFromCartItems } from '../checkout-page/CheckoutPage'
import { getGuestId, getToken } from '../checkout-page/functions/getGuestUserId'
import LocationModalAlert from '../food-card/LocationModalAlert'
import { ReadMore } from '../landingpage/ReadMore'
import {
    getSelectedAddons,
    getSelectedVariations,
} from '../navbar/second-navbar/SecondNavbar'
import FoodModalTopSection from './FoodModalTopSection'
import IncrementDecrementManager from './IncrementDecrementManager'
import VagSvg from './VagSvg'
import { handleInitialTotalPriceVarPriceQuantitySet } from './helper-functions/handleDataOnFirstMount'

const FoodDetailModal = ({
    product,
    image,
    open,
    handleModalClose,
    setOpen,
    currencySymbolDirection,
    currencySymbol,
    digitAfterDecimalPoint,
    productUpdate,
    handleBadge,
    campaign,
}) => {
    const router = useRouter()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const theme = useTheme()
    const { global } = useSelector((state) => state.globalSettings)
    const [selectedOptions, setSelectedOptions] = useState([])
    const [isLocation, setIsLocation] = useState(false)
    const [totalPrice, setTotalPrice] = useState(null)
    const [modalFor, setModalFor] = useState('sign-in')
    const [add_on, setAddOns] = useState([])
    const { cartList } = useSelector((state) => state.cart)
    const [quantity, setQuantity] = useState(1)
    const [clearCartModal, setClearCartModal] = useState(false)
    const handleClearCartModalOpen = () => setClearCartModal(true)
    const { token } = useSelector((state) => state.userToken)
    const { wishLists } = useSelector((state) => state.wishList)
    const [modalData, setModalData] = useState([])
    const { mutate: addToCartMutate, isLoading: addToCartLoading } =
        useAddCartItem()
    const { mutate: updateMutate } = useCartItemUpdate()
    const { mutate: deleteCartItemMutate } = useDeleteAllCartItem()
    const itemSuccess = (res) => {
        // if (res) {
        //     handleInitialTotalPriceVarPriceQuantitySet(
        //         res,
        //         setModalData,
        //         productUpdate,
        //         setTotalPrice,
        //         setQuantity,
        //         setSelectedOptions
        //     )
        //     setAddOns([])
        //     setSelectedOptions([])
        // }
    }
    const {
        data: foodDetails,
        refetch,
        isLoading: itemIsLoading,
        isRefetching,
    } = useGetFoodDetails({ id: product?.id, campaign }, itemSuccess,productUpdate)


    useEffect(()=>{
       if(foodDetails){
           {
               handleInitialTotalPriceVarPriceQuantitySet(
                   foodDetails,
                   setModalData,
                   productUpdate,
                   setTotalPrice,
                   setQuantity,
                   setSelectedOptions
               )
               setAddOns([])
               setSelectedOptions([])
           }
       }
    },[foodDetails])

    useEffect(() => {
        if (productUpdate) {
            handleInitialTotalPriceVarPriceQuantitySet(
                product,
                setModalData,
                productUpdate,
                setTotalPrice,
                setQuantity,
                setSelectedOptions
            )
        }

        //initially setting these states to use further
    }, [product])
    // useEffect(() => {
    //     if (!productUpdate) {
    //         refetch()
    //     }
    // }, [])
    let location = undefined
    if (typeof window !== 'undefined') {
        location = localStorage.getItem('location')
    }
    const itemValuesHandler = (itemIndex, variationValues) => {
        const isThisValExistWithinSelectedValues = selectedOptions.filter(
            (sItem) => sItem.choiceIndex === itemIndex
        )
        if (variationValues.length > 0) {
            let newVariation = variationValues.map((vVal, vIndex) => {
                let exist =
                    isThisValExistWithinSelectedValues.length > 0 &&
                    isThisValExistWithinSelectedValues.find(
                        (item) => item.optionIndex === vIndex
                    )
                if (exist) {
                    return exist
                } else {
                    return { ...vVal, isSelected: false }
                }
            })
            return newVariation
        } else {
            return variationValues
        }
    }

    const getNewVariationForDispatch = () => {
        const newVariations = modalData?.[0]?.variations?.map((item, index) => {
            if (selectedOptions.length > 0) {
                return {
                    ...item,
                    values:
                        item.values.length > 0
                            ? itemValuesHandler(index, item.values)
                            : item.values,
                }
            } else {
                return item
            }
        })
        return newVariations
    }
    const handleSuccess = (res) => {
        if (res) {
            let product = {}
            res?.forEach((item) => {
                product = {
                    ...item?.item,
                    cartItemId: item?.id,
                    totalPrice: item?.price,
                    quantity: item?.quantity,
                    variations: item?.item?.variations,
                    selectedAddons: add_on,
                    selectedOptions: selectedOptions,
                    itemBasePrice: getConvertDiscount(
                        item?.item?.discount,
                        item?.item?.discount_type,
                        calculateItemBasePrice(modalData[0], selectedOptions),
                        item?.item?.restaurant_discount
                    ),
                }
            })
            dispatch(setCart(product))
            CustomToaster('success', 'Item added to cart')
            handleClose()
        }
    }

    const cartListSuccessHandler = (res) => {
        if (res) {
            const setItemIntoCart = () => {
                return res?.map((item) => ({
                    ...item?.item,
                    cartItemId: item?.id,
                    totalPrice:
                        getConvertDiscount(
                            item?.item?.discount,
                            item?.item?.discount_type,
                            handleProductValueWithOutDiscount(item?.item),
                            item?.item?.restaurant_discount
                        ) * item?.quantity,
                    selectedAddons: getSelectedAddons(item?.item?.addons),
                    quantity: item?.quantity,
                    variations: item?.item?.variations,
                    itemBasePrice: getConvertDiscount(
                        item?.item?.discount,
                        item?.item?.discount_type,
                        calculateItemBasePrice(
                            item?.item,
                            item?.item?.variations
                        ),
                        item?.item?.restaurant_discount
                    ),
                    selectedOptions: getSelectedVariations(
                        item?.item?.variations
                    ),
                }))
            }
            dispatch(cart(setItemIntoCart()))
            CustomToaster('success', 'Item updated successfully')
            handleModalClose?.()
        }
    }

    const handleAddUpdate = () => {
        if (productUpdate) {
            //for updating
            let totalQty = 0
            const itemObject = {
                cart_id: product?.cart_id,
                guest_id: getGuestId(),
                model: product?.available_date_starts ? 'ItemCampaign' : 'Food',
                add_on_ids:
                    add_on?.length > 0
                        ? add_on?.map((add) => {
                              return add.id
                          })
                        : [],
                add_on_qtys:
                    add_on?.length > 0
                        ? add_on?.map((add) => {
                              totalQty = add.quantity
                              return totalQty
                          })
                        : [],
                item_id: product?.id,
                price: getConvertDiscount(
                    product?.discount,
                    product?.discount_type,
                    totalPrice,
                    product?.restaurant_discount,
                    quantity
                ),
                quantity: quantity,
                variation_options: selectedOptions?.map(
                    (item) => item.option_id
                ),
                variations:
                    getNewVariationForDispatch()?.length > 0
                        ? getNewVariationForDispatch()?.map((variation) => {
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

            updateMutate(itemObject, {
                onSuccess: cartListSuccessHandler,
                onError: (error) => {
                    error?.response?.data?.errors?.forEach((item) => {
                        CustomToaster('error', item?.message)
                        if (item?.code === 'stock_out') {
                            refetch()
                        }
                    })
                },
            })
        } else {
            let totalQty = 0
            const itemObject = {
                guest_id: getGuestId(),
                model: modalData[0]?.available_date_starts
                    ? 'ItemCampaign'
                    : 'Food',
                add_on_ids:
                    add_on?.length > 0
                        ? add_on?.map((add) => {
                              return add.id
                          })
                        : [],
                add_on_qtys:
                    add_on?.length > 0
                        ? add_on?.map((add) => {
                              totalQty = add.quantity
                              return totalQty
                          })
                        : [],
                item_id: modalData[0]?.id,
                price: getConvertDiscount(
                    modalData[0]?.discount,
                    modalData[0]?.discount_type,
                    totalPrice,
                    modalData[0]?.restaurant_discount,
                    quantity
                ),
                quantity: quantity,
                variations:
                    getNewVariationForDispatch()?.length > 0
                        ? getNewVariationForDispatch()?.map((variation) => {
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
                variation_options: selectedOptions?.map(
                    (item) => item.option_id
                ),
            }
            addToCartMutate(itemObject, {
                onSuccess: handleSuccess,
                onError: (error) => {
                    error?.response?.data?.errors?.forEach((item) => {
                        CustomToaster('error', item?.message)
                        if (item?.code === 'stock_out') {
                            refetch()
                        }
                    })
                },
            })
        }
    }

    const addOrUpdateToCartByDispatch = () => {
        if (cartList?.length > 0) {
            //checking same restaurant items already exist or not
            const isRestaurantExist = cartList?.find(
                (item) => item.restaurant_id === modalData[0].restaurant_id
            )
            if (isRestaurantExist) {
                handleAddUpdate()
            } else {
                if (cartList.length !== 0) {
                    handleClearCartModalOpen()
                }
            }
        } else {
            handleAddUpdate()
        }
    }
    const handleCampaignOrder = () => {
        dispatch(
            setCampCart({
                ...modalData[0],
                totalPrice: totalPrice,
                quantity: quantity,
                variations: getNewVariationForDispatch(),
                selectedAddons: add_on,
            })
        )
        router.push(`/checkout?page=campaign`)
    }

    const handleProductAddUpdate = (checkingFor) => {
        if (checkingFor === 'cart') {
            addOrUpdateToCartByDispatch()
        } else if (checkingFor === 'campaign') {
            handleCampaignOrder()
        }
    }

    const handleRequiredItemsToaster = (itemsArray, selectedOptions) => {
        itemsArray?.forEach((item) => {
            if (selectedOptions.length > 0) {
                selectedOptions?.forEach((sOption) => {
                    if (sOption.choiceIndex !== item.indexNumber) {
                        const text = item.name
                        let checkingQuantity = false
                        handleProductVariationRequirementsToaster(
                            text,
                            checkingQuantity,
                            t
                        )
                    }
                })
            } else {
                const text = item.name
                let checkingQuantity = false
                handleProductVariationRequirementsToaster(
                    text,
                    checkingQuantity,
                    t
                )
            }
        })
    }
    const optionalVariationSelectionMinMax = () => {
        const selectedValues = selectedOptions.filter(
            (item) => item.type === 'optional'
        )
        let isTrue = false
        if (selectedValues.length > 0) {
            const selectedIndexCount = []
            selectedValues.forEach((item) =>
                selectedIndexCount.push(item.choiceIndex)
            )
            const indexWithoutDuplicates = [...new Set(selectedIndexCount)]
            if (indexWithoutDuplicates.length > 0) {
                indexWithoutDuplicates.forEach((itemIndex) => {
                    let optionalItemIndex = modalData?.[0]?.variations?.find(
                        (mItem, index) => index === itemIndex
                    )

                    if (optionalItemIndex) {
                        if (optionalItemIndex.type === 'multi') {
                            let indexNum = modalData[0]?.variations?.findIndex(
                                (mItem) => mItem.name === optionalItemIndex.name
                            )
                            let count = 0
                            selectedIndexCount.forEach((indexN) => {
                                if (indexN === indexNum) {
                                    count += 1
                                }
                            })

                            if (
                                count >=
                                    Number.parseInt(optionalItemIndex.min) &&
                                count <= Number.parseInt(optionalItemIndex.max)
                            ) {
                                isTrue = true
                            } else {
                                const text = {
                                    name: optionalItemIndex.name,
                                    min: optionalItemIndex.min,
                                    max: optionalItemIndex.max,
                                }
                                let checkingQuantity = true
                                isTrue = false
                                let id = true
                                handleProductVariationRequirementsToaster(
                                    text,
                                    checkingQuantity,
                                    t,
                                    id
                                )
                            }
                        } else {
                            isTrue = true
                        }
                    } else {
                        isTrue = true
                    }
                })
            } else {
                isTrue = true
            }
        } else {
            isTrue = true
        }

        return isTrue
    }

    const handleAddToCartOnDispatch = (checkingFor) => {
        let requiredItemsList = []
        modalData?.[0]?.variations?.forEach((item, index) => {
            if (item.required === 'on') {
                const itemObj = {
                    indexNumber: index,
                    type: item.type,
                    max: item.max,
                    min: item.min,
                    name: item.name,
                }
                requiredItemsList.push(itemObj)
            }
        })

        if (requiredItemsList.length > 0) {
            if (selectedOptions.length === 0) {
                handleRequiredItemsToaster(requiredItemsList, selectedOptions)
            } else {
                let itemCount = 0

                requiredItemsList?.forEach((item, index) => {
                    const isExistInSelection = selectedOptions?.find(
                        (sitem) => sitem.choiceIndex === item.indexNumber
                    )

                    if (isExistInSelection) {
                        if (item.type === 'single') {
                            //call add/update to cart functionalities
                            itemCount += 1
                        } else {
                            //check based on min max for multiple selection
                            let selectedOptionCount = 0
                            selectedOptions?.forEach((item) => {
                                if (
                                    item.choiceIndex ===
                                    isExistInSelection?.choiceIndex
                                ) {
                                    selectedOptionCount += 1
                                }
                            })
                            if (
                                selectedOptionCount >=
                                    Number.parseInt(item.min) &&
                                selectedOptionCount <= Number.parseInt(item.max)
                            ) {
                                //call add/update to cart functionalities
                                itemCount += 1
                            } else {
                                const text = {
                                    name: item.name,
                                    min: item.min,
                                    max: item.max,
                                }
                                let checkingQuantity = true

                                handleProductVariationRequirementsToaster(
                                    text,
                                    checkingQuantity,
                                    t
                                )
                            }
                        }
                        if (
                            itemCount === requiredItemsList.length &&
                            optionalVariationSelectionMinMax(
                                selectedOptions,
                                modalData
                            )
                        ) {
                            handleProductAddUpdate(checkingFor)
                        }
                    } else {
                        handleRequiredItemsToaster(
                            requiredItemsList,
                            selectedOptions
                        )
                    }
                })
            }
        } else {
            handleProductAddUpdate(checkingFor)
        }
    }
    const addToCard = () => {
        if (location) {
            let checkingFor = 'cart'
            if (
                modalData[0]?.item_stock === 0 &&
                selectedOptions?.length === 0 &&
                modalData[0].stock_type !== 'unlimited'
            ) {
                CustomToaster('error', t('Out Of Stock'), 'add')
            } else {
                handleAddToCartOnDispatch(checkingFor)
            }
        } else {
            setIsLocation(true)
        }
    }
    const clearCartAlert = () => {
        deleteCartItemMutate(getGuestId(), {
            onError: onErrorResponse,
        })
        dispatch(setClearCart())

        //setClearCartModal(false)
        toast.success(
            t(
                'Previously added restaurant foods have been removed from cart and the selected one added'
            ),
            {
                duration: 6000,
            }
        )
        handleAddUpdate?.()
    }
    const handleClose = () => setOpen(false)

    const changeChoices = (
        e,
        option,
        optionIndex,
        choiceIndex,
        isRequired,
        choiceType,
        checked
    ) => {
        if (choiceType === 'single') {
            if (checked) {
                setQuantity(1)
                //selected or checked variation handling
                if (selectedOptions.length > 0) {
                    const isExist = selectedOptions.find(
                        (item) =>
                            item.choiceIndex === choiceIndex &&
                            item.optionIndex === optionIndex
                    )
                    if (isExist) {
                        const newSelectedOptions = selectedOptions.filter(
                            (sOption) =>
                                sOption.choiceIndex === choiceIndex &&
                                sOption.label !== isExist.label
                        )
                        setSelectedOptions(newSelectedOptions)
                        setTotalPrice(
                            (prevState) =>
                                prevState -
                                Number.parseInt(option.optionPrice) * quantity
                        )
                    } else {
                        const isItemExistFromSameVariation =
                            selectedOptions.find(
                                (item) => item.choiceIndex === choiceIndex
                            )
                        if (isItemExistFromSameVariation) {
                            const newObjs = selectedOptions.map((item) => {
                                if (item.choiceIndex === choiceIndex) {
                                    return {
                                        choiceIndex: choiceIndex,
                                        ...option,
                                        optionIndex: optionIndex,
                                        isSelected: true,
                                        type:
                                            isRequired === 'on'
                                                ? 'required'
                                                : 'optional',
                                    }
                                } else {
                                    return item
                                }
                            })
                            setSelectedOptions(newObjs)
                            //changing total price by removing previous ones price and adding new selection options price
                            setTotalPrice(
                                (prevState) =>
                                    prevState -
                                    Number.parseInt(
                                        isItemExistFromSameVariation.optionPrice
                                    ) *
                                        quantity +
                                    Number.parseInt(option.optionPrice) *
                                        quantity
                            )
                        } else {
                            const newObj = {
                                choiceIndex: choiceIndex,
                                ...option,
                                optionIndex: optionIndex,
                                isSelected: true,
                                type:
                                    isRequired === 'on'
                                        ? 'required'
                                        : 'optional',
                            }
                            setSelectedOptions([...selectedOptions, newObj])
                            setTotalPrice(
                                (prevState) =>
                                    prevState +
                                    Number.parseInt(option.optionPrice) *
                                        quantity
                            )
                        }
                    }
                } else {
                    // for a new selected variation
                    const newObj = {
                        choiceIndex: choiceIndex,
                        ...option,
                        optionIndex: optionIndex,
                        isSelected: true,
                        type: isRequired === 'on' ? 'required' : 'optional',
                    }
                    setSelectedOptions([newObj])
                    setTotalPrice(
                        (prevState) =>
                            prevState +
                            Number.parseInt(option.optionPrice) * quantity
                    )
                }
            } else {
                // uncheck or unselect variation handle
                const filtered = selectedOptions.filter((item) => {
                    if (item.choiceIndex === choiceIndex) {
                        if (item.label !== option.label) {
                            return item
                        }
                    } else {
                        return item
                    }
                })
                setSelectedOptions(filtered)

                setTotalPrice(
                    (prevState) =>
                        prevState -
                        Number.parseInt(option.optionPrice) * quantity
                )
            }
        } else {
            //for multiple optional variation selection
            if (e.target.checked) {
                setQuantity(1)
                // setIsCheck(e.target.checked)
                setSelectedOptions((prevState) => [
                    ...prevState,
                    {
                        choiceIndex: choiceIndex,
                        ...option,
                        optionIndex: optionIndex,
                        isSelected: true,
                        type: isRequired === 'on' ? 'required' : 'optional',
                    },
                ])
                setTotalPrice(
                    (prevState) =>
                        prevState +
                        Number.parseInt(option.optionPrice) * quantity
                )
            } else {
                const filtered = selectedOptions.filter((item) => {
                    if (item.choiceIndex === choiceIndex) {
                        if (item.label !== option.label) {
                            return item
                        }
                    } else {
                        return item
                    }
                })
                setSelectedOptions(filtered)
                setTotalPrice(
                    (prevState) =>
                        prevState -
                        Number.parseInt(option.optionPrice) * quantity
                )
            }
        }
    }
    const radioCheckHandler = (choiceIndex, option, optionIndex) => {
        const isExist = selectedOptions?.find(
            (sOption) =>
                sOption.choiceIndex === choiceIndex &&
                sOption.optionIndex === optionIndex
        )
        return !!isExist
    }
    const changeAddOns = (checkTrue, addOn) => {
        let filterAddOn = add_on.filter((item) => item.name !== addOn.name)
        if (checkTrue) {
            setAddOns([...filterAddOn, addOn])
        } else {
            setAddOns(filterAddOn)
        }
    }
    const handleTotalPrice = () => {
        let price
        if (productUpdate) {
            if (modalData.length > 0) {
                price = modalData?.[0]?.price
            }
        } else {
            price = modalData[0]?.price
        }
        if (selectedOptions?.length > 0) {
            selectedOptions?.forEach(
                (item) => (price += Number.parseInt(item?.optionPrice))
            )
        }
        setTotalPrice(price * quantity)
    }
    useEffect(() => {
        if (modalData[0]) {
            handleTotalPrice()
        }
    }, [quantity, modalData])
    const decrementPrice = () => {
        setQuantity((prevQty) => prevQty - 1)
    }

    const incrementPrice = () => {
        const isLimitedOrDaily = modalData[0]?.stock_type !== 'unlimited'
        const maxCartQuantity = modalData[0]?.maximum_cart_quantity
        // Helper function to check stock limits and update quantity
        const tryUpdateQuantity = (stockLimit) => {
            if (quantity >= stockLimit && isLimitedOrDaily) {
                CustomToaster('error', t('Out Of Stock'), 'stock')
            } else if (maxCartQuantity && quantity >= maxCartQuantity) {
                CustomToaster('error', 'Out Of Limits', 'Quantity')
            } else {
                setQuantity((prevQty) => prevQty + 1)
            }
        }

        if (selectedOptions?.length > 0) {
            // Calculate the minimum stock from selected options
            const minStock = selectedOptions.reduce(
                (min, item) => Math.min(min, parseInt(item.current_stock)),
                Infinity
            )

            // If stock type is limited or daily, check against minStock
            if (quantity >= modalData[0]?.item_stock && isLimitedOrDaily) {
                CustomToaster('error', t('Out Of Stock'), 'stock')
            } else {
                if (isLimitedOrDaily) {
                    tryUpdateQuantity(minStock)
                } else {
                    // If not limited/daily, just check against max cart quantity
                    tryUpdateQuantity(Infinity)
                }
            }
        } else {
            // No options selected, check directly against item stock or max cart quantity
            const itemStock = modalData[0]?.item_stock
            if (isLimitedOrDaily && itemStock !== undefined) {
                tryUpdateQuantity(itemStock)
            } else {
                tryUpdateQuantity(Infinity)
            }
        }
    }

    const { mutate: addFavoriteMutation } = useMutation(
        'add-favourite',
        () => ProductsApi.addFavorite(product.id),
        {
            onSuccess: (response) => {
                if (response?.data) {
                    dispatch(addWishList(product))
                    CustomToaster('success', response.data.message)
                }
            },
            onError: (error) => {
                CustomToaster('error', error.response.data.message)
            },
        }
    )

    const addToFavorite = () => {
        if (token) {
            addFavoriteMutation()
        } else CustomToaster('error', 'You are not logged in')
    }

    const onSuccessHandlerForDelete = (res) => {
        dispatch(removeWishListFood(product.id))
        CustomToaster('success', res.message)
    }
    const { mutate } = useWishListDelete()
    const deleteWishlistItem = (id) => {
        mutate(id, {
            onSuccess: onSuccessHandlerForDelete,
            onError: (error) => {
                CustomToaster('error', error.response.data.message)
            },
        })
    }
    const isInCart = (id) => {
        if (productUpdate) {
            const isInCart = cartList.filter((item) => item.id === id)
            return isInCart.length > 0
        }
    }

    const isInList = (id) => {
        return !!wishLists?.food?.find((wishFood) => wishFood.id === id)
    }
    //auth modal
    const [authModalOpen, setAuthModalOpen] = useState(false)

    const orderNow = () => {
        if (location) {
            if (getToken()) {
                let checkingFor = 'campaign'
                handleAddToCartOnDispatch(checkingFor)
            } else {
                setAuthModalOpen(true)
            }
        } else {
            setIsLocation(true)
        }
    }
    const handleSignInSuccess = () => {
        dispatch(
            setCampCart({
                ...modalData[0],
                totalPrice: totalPrice,
                quantity: quantity,
                selectedAddons: add_on,
            })
        )
        router.push(`/checkout?page=campaign`)
    }
    const getFullFillRequirements = () => {
        let isdisabled = false
        if (modalData[0]?.variations?.length > 0) {
            modalData[0]?.variations?.forEach((variation, index) => {
                if (variation?.type === 'multi') {
                    const selectedIndex = selectedOptions?.filter(
                        (item) => item.choiceIndex === index
                    )
                    if (selectedIndex && selectedIndex.length > 0) {
                        isdisabled =
                            selectedIndex.length >= variation.min &&
                            selectedIndex.length <= variation.max
                    }
                } else {
                    const singleVariation = modalData[0]?.variations?.filter(
                        (item) =>
                            item?.type === 'single' && item?.required === 'on'
                    )
                    const requiredSelected = selectedOptions?.filter(
                        (item) => item?.type === 'required'
                    )
                    isdisabled =
                        singleVariation?.length === requiredSelected?.length
                }
            })
        } else {
            isdisabled = true
        }
        return isdisabled
    }

    const isUpdateDisabled = () => {
        if (selectedOptions && selectedOptions.length > 0) {
            return selectedOptions.some((option) => option.current_stock === 0)
        }
        return false
    }

    const text1 = t('only')
    const text2 = t('items available')

    return (
        <>
            <Modal
                open={open}
                onClose={handleModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                disableAutoFocus={true}
            >
                <FoodDetailModalStyle sx={{ bgcolor: 'background.paper' }} >
                    {!itemIsLoading && modalData[0] ? (
                        <>
                            {isLocation ? (
                                <LocationModalAlert
                                    setOpenAddressModalAlert={setOpen}
                                />
                            ) : (
                                <CustomStackFullWidth>
                                    <FoodModalTopSection
                                        product={modalData[0]}
                                        image={image}
                                        handleModalClose={handleModalClose}
                                        isInList={isInList}
                                        deleteWishlistItem={deleteWishlistItem}
                                        addToFavorite={addToFavorite}
                                    />

                                    <CustomStackFullWidth
                                        sx={{ padding: '20px' }}
                                        spacing={2}
                                    >
                                        <SimpleBar
                                            style={{
                                                maxHeight: '35vh',
                                                paddingRight: '10px',
                                            }}
                                            className="test123"
                                        >
                                            <CustomStackFullWidth spacing={0.5}>
                                                <Stack
                                                    direction="row"
                                                    justifyContent="flex-start"
                                                    alignItems="center"
                                                    flexWrap="wrap"
                                                    spacing={0.5}
                                                >
                                                    <Typography variant="h4">
                                                        {modalData.length > 0 &&
                                                            modalData[0]?.name}
                                                    </Typography>
                                                    {global?.toggle_veg_non_veg ? (
                                                        <VagSvg
                                                            color={
                                                                Number(
                                                                    modalData[0]
                                                                        ?.veg
                                                                ) === 0
                                                                    ? theme
                                                                          .palette
                                                                          .nonVeg
                                                                    : theme
                                                                          .palette
                                                                          .success
                                                                          .light
                                                            }
                                                        />
                                                    ) : null}
                                                    {modalData[0]
                                                        ?.halal_tag_status ===
                                                        1 &&
                                                        modalData[0]
                                                            ?.is_halal ===
                                                            1 && (
                                                            <Tooltip
                                                                arrow
                                                                title={t(
                                                                    'This is a halal food'
                                                                )}
                                                            >
                                                                <IconButton
                                                                    sx={{
                                                                        padding:
                                                                            '0px',
                                                                    }}
                                                                >
                                                                    <HalalSvg />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    {quantity >=
                                                        modalData[0]
                                                            ?.item_stock &&
                                                        modalData[0]
                                                            ?.stock_type !==
                                                            'unlimited' && (
                                                            <Typography
                                                                fontSize="12px"
                                                                color={
                                                                    quantity >=
                                                                        modalData[0]
                                                                            ?.item_stock &&
                                                                    theme
                                                                        .palette
                                                                        .info
                                                                        .main
                                                                }
                                                            >
                                                                ({text1}{' '}
                                                                {
                                                                    modalData[0]
                                                                        ?.item_stock
                                                                }{' '}
                                                                {text2})
                                                            </Typography>
                                                        )}
                                                </Stack>
                                                <ReadMore
                                                    limits="100"
                                                    color={
                                                        theme.palette
                                                            .neutral[400]
                                                    }
                                                >
                                                    {modalData?.length > 0 &&
                                                        modalData[0]
                                                            ?.description}
                                                </ReadMore>
                                                {modalData[0]?.nutritions_name
                                                    ?.length > 0 && (
                                                    <>
                                                        <Typography
                                                            fontSize="14px"
                                                            fontWeight="500"
                                                            mt="5px"
                                                        >
                                                            {t(
                                                                'Nutrition Details'
                                                            )}
                                                        </Typography>

                                                        <Stack
                                                            direction="row"
                                                            spacing={0.5}
                                                        >
                                                            {modalData[0]?.nutritions_name?.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => (
                                                                    <Typography
                                                                        fontSize="12px"
                                                                        key={
                                                                            index
                                                                        }
                                                                        color={
                                                                            theme
                                                                                .palette
                                                                                .neutral[400]
                                                                        }
                                                                    >
                                                                        {item}
                                                                        {index !==
                                                                        modalData[0]
                                                                            ?.nutritions_name
                                                                            .length -
                                                                            1
                                                                            ? ','
                                                                            : '.'}
                                                                    </Typography>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </>
                                                )}
                                                {modalData[0]?.allergies_name
                                                    ?.length > 0 && (
                                                    <>
                                                        <Typography
                                                            fontSize="14px"
                                                            fontWeight="500"
                                                            mt="5px"
                                                        >
                                                            {t(
                                                                'Allergic Ingredients'
                                                            )}
                                                        </Typography>

                                                        <Stack
                                                            direction="row"
                                                            spacing={0.5}
                                                        >
                                                            {modalData[0]?.allergies_name?.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => (
                                                                    <Typography
                                                                        fontSize="12px"
                                                                        key={
                                                                            index
                                                                        }
                                                                        color={
                                                                            theme
                                                                                .palette
                                                                                .neutral[400]
                                                                        }
                                                                    >
                                                                        {item}
                                                                        {index !==
                                                                        modalData[0]
                                                                            ?.allergies_name
                                                                            .length -
                                                                            1
                                                                            ? ','
                                                                            : '.'}
                                                                    </Typography>
                                                                )
                                                            )}
                                                        </Stack>
                                                    </>
                                                )}
                                                <Stack
                                                    spacing={1}
                                                    direction={{
                                                        xs: 'row',
                                                        sm: 'row',
                                                        md: 'row',
                                                    }}
                                                    justifyContent={{
                                                        xs: 'space-between',
                                                        sm: 'space-between',
                                                        md: 'space-between',
                                                    }}
                                                    alignItems="center"
                                                >
                                                    <StartPriceView
                                                        data={modalData[0]}
                                                        currencySymbolDirection={
                                                            currencySymbolDirection
                                                        }
                                                        currencySymbol={
                                                            currencySymbol
                                                        }
                                                        digitAfterDecimalPoint={
                                                            digitAfterDecimalPoint
                                                        }
                                                        hideStartFromText="false"
                                                        handleBadge={
                                                            handleBadge
                                                        }
                                                        selectedOptions={
                                                            selectedOptions
                                                        }
                                                    />

                                                    <IncrementDecrementManager
                                                        decrementPrice={
                                                            decrementPrice
                                                        }
                                                        totalPrice={totalPrice}
                                                        quantity={quantity}
                                                        incrementPrice={
                                                            incrementPrice
                                                        }
                                                    />
                                                </Stack>
                                            </CustomStackFullWidth>
                                            {modalData?.length > 0 &&
                                                modalData[0]?.variations
                                                    ?.length > 0 && (
                                                    <VariationsManager
                                                        quantity={quantity}
                                                        selectedOptions={
                                                            selectedOptions
                                                        }
                                                        t={t}
                                                        modalData={modalData}
                                                        radioCheckHandler={
                                                            radioCheckHandler
                                                        }
                                                        changeChoices={
                                                            changeChoices
                                                        }
                                                        currencySymbolDirection={
                                                            currencySymbolDirection
                                                        }
                                                        currencySymbol={
                                                            currencySymbol
                                                        }
                                                        digitAfterDecimalPoint={
                                                            digitAfterDecimalPoint
                                                        }
                                                        itemIsLoading={
                                                            isRefetching
                                                        }
                                                        productUpdate={
                                                            productUpdate
                                                        }
                                                    />
                                                )}
                                            {modalData?.length > 0 &&
                                                modalData[0]?.add_ons?.length >
                                                    0 && (
                                                    <AddOnsManager
                                                        t={t}
                                                        modalData={modalData}
                                                        setTotalPrice={
                                                            setTotalPrice
                                                        }
                                                        changeAddOns={
                                                            changeAddOns
                                                        }
                                                        product={modalData[0]}
                                                        setAddOns={setAddOns}
                                                        add_on={add_on}
                                                        quantity={quantity}
                                                        cartList={cartList}
                                                        itemIsLoading={
                                                            isRefetching
                                                        }
                                                    />
                                                )}
                                        </SimpleBar>
                                        <Grid container direction="row">
                                            <Grid
                                                item
                                                md={7}
                                                sm={12}
                                                xs={12}
                                                alignSelf="center"
                                            >
                                                <TotalAmountVisibility
                                                    modalData={modalData}
                                                    totalPrice={totalPrice}
                                                    currencySymbolDirection={
                                                        currencySymbolDirection
                                                    }
                                                    currencySymbol={
                                                        currencySymbol
                                                    }
                                                    digitAfterDecimalPoint={
                                                        digitAfterDecimalPoint
                                                    }
                                                    t={t}
                                                    productDiscount={
                                                        modalData[0]?.discount
                                                    }
                                                    productDiscountType={
                                                        modalData[0]
                                                            ?.discount_type
                                                    }
                                                    productRestaurantDiscount={
                                                        modalData[0]
                                                            ?.restaurant_discount
                                                    }
                                                    selectedAddOns={add_on}
                                                    quantity={quantity}
                                                />
                                            </Grid>
                                            <Grid
                                                item
                                                md={
                                                    !isAvailable(
                                                        modalData[0]
                                                            ?.available_time_starts,
                                                        modalData[0]
                                                            ?.available_time_ends
                                                    )
                                                        ? 12
                                                        : 5
                                                }
                                                sm={12}
                                                xs={12}
                                            >
                                                {modalData?.length > 0 &&
                                                isAvailable(
                                                    modalData[0]
                                                        ?.available_time_starts,
                                                    modalData[0]
                                                        ?.available_time_ends
                                                ) ? (
                                                    <>
                                                        {isInCart(
                                                            modalData[0].id
                                                        ) && (
                                                            <UpdateToCartUi
                                                                addToCard={
                                                                    addToCard
                                                                }
                                                                t={t}
                                                                isUpdateDisabled={
                                                                    isUpdateDisabled
                                                                }
                                                            />
                                                        )}
                                                        {!isInCart(
                                                            product.id
                                                        ) && (
                                                            <AddOrderToCart
                                                                addToCartLoading={
                                                                    addToCartLoading
                                                                }
                                                                product={
                                                                    modalData[0]
                                                                }
                                                                t={t}
                                                                addToCard={
                                                                    addToCard
                                                                }
                                                                orderNow={
                                                                    orderNow
                                                                }
                                                                getFullFillRequirements={
                                                                    getFullFillRequirements
                                                                }
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    <AddUpdateOrderToCart
                                                        addToCartLoading={
                                                            addToCartLoading
                                                        }
                                                        modalData={modalData}
                                                        isInCart={isInCart}
                                                        addToCard={addToCard}
                                                        t={t}
                                                        product={modalData[0]}
                                                        orderNow={orderNow}
                                                        getFullFillRequirements={
                                                            getFullFillRequirements
                                                        }
                                                        isUpdateDisabled={
                                                            isUpdateDisabled
                                                        }
                                                    />
                                                )}
                                            </Grid>
                                        </Grid>
                                    </CustomStackFullWidth>
                                </CustomStackFullWidth>
                            )}
                        </>
                    ) : (
                        !productUpdate && (
                            <CustomStackFullWidth
                                sx={{ padding: '10px' }}
                                spacing={1}
                            >
                                <Skeleton
                                    variant="rectangular"
                                    witdh="100%"
                                    height="200px"
                                />
                                <Skeleton
                                    variant="rounded"
                                    width={100}
                                    height={10}
                                />
                                <Skeleton
                                    variant="rounded"
                                    width="50%"
                                    height={15}
                                />
                                <Skeleton
                                    variant="rounded"
                                    width={60}
                                    height={10}
                                />
                                <Stack mt="10px" spacing={1}>
                                    <Skeleton
                                        variant="rounded"
                                        width="30%"
                                        height={15}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={60}
                                        height={10}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width={60}
                                        height={10}
                                    />
                                </Stack>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Skeleton
                                        variant="rounded"
                                        width="30%"
                                        height={15}
                                    />
                                    <Skeleton
                                        variant="rounded"
                                        width="50%"
                                        height={30}
                                    />
                                </Stack>
                            </CustomStackFullWidth>
                        )
                    )}
                </FoodDetailModalStyle>
            </Modal>
            <CartClearModal
                clearCartModal={clearCartModal}
                setClearCartModal={setClearCartModal}
                clearCartAlert={clearCartAlert}
                addToCard={addToCard}
            />
            {authModalOpen && (
                <AuthModal
                    open={authModalOpen}
                    handleClose={() => setAuthModalOpen(false)}
                    signInSuccess={handleSignInSuccess}
                    modalFor={modalFor}
                    setModalFor={setModalFor}
                />
            )}
        </>
    )
}

export default FoodDetailModal
