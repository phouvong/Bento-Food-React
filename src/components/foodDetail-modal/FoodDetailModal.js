import {
    Grid,
    Modal,
    Typography,
    Stack,
    Box,
    Button,
    IconButton,
    alpha,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ProductsApi } from '@/hooks/react-query/config/productsApi'
import { useWishListDelete } from '@/hooks/react-query/config/wish-list/useWishListDelete'
import {
    cart,
    setCampCart,
    setCart,
    setClearCart,
} from '@/redux/slices/cart'
import {
    mapRestaurantCartRows,
    refreshCartGroups,
} from '@/hooks/react-query/add-cart/useGetAllCartList'
import { addWishList, removeWishListFood } from '@/redux/slices/wishList'
import { calculateItemBasePrice, isAvailable } from '@/utils/customFunctions'
import { rawFoodDataNormalize } from '@/components/new-food-card/rawFoodDataNormalize'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from 'react-query'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import AuthModal from '../auth'
import { FoodDetailModalStyle } from '../home/HomeStyle'
import AddOnsManager from './AddOnsManager'
import AddOrderToCart from './AddOrderToCart'
import AddUpdateOrderToCart from './AddUpdateOrderToCart'
import { handleProductVariationRequirementsToaster } from './SomeHelperFuctions'
import TotalAmountVisibility from './TotalAmountVisibility'
import UpdateToCartUi from './UpdateToCartUi'
import VariationsManager from './VariationsManager'
import { CustomToaster } from '@/components/custom-toaster/CustomToaster'
import { useGetFoodDetails } from '@/hooks/react-query/food/useGetFoodDetails'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import Skeleton from '@mui/material/Skeleton'
import useAddCartItem from '../../hooks/react-query/add-cart/useAddCartItem'
import useCartItemUpdate from '../../hooks/react-query/add-cart/useCartItemUpdate'
import { handleValuesFromCartItems } from '../checkout-page/CheckoutPage'
import { getGuestId, getToken } from '../checkout-page/functions/getGuestUserId'
import LocationModalAlert from '../food-card/LocationModalAlert'
import FoodDescription from './FoodDescription'
import { requiredOptionButtonSx } from './FoodModalStyle'
import {
    getSelectedAddons,
    getSelectedVariations,
} from '../navbar/second-navbar/SecondNavbar'
import FoodModalTopSection from './FoodModalTopSection'
import IncrementDecrementManager from './IncrementDecrementManager'
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
    // handleBadge is still passed by some callers; price/badges now render
    // inside FoodModalTopSection so it is accepted but unused here.
    handleBadge,
    campaign,
    paperSx,
    reelId,
}) => {
    console.log({ product })
    const router = useRouter()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const queryClient = useQueryClient()
    const theme = useTheme()
    const { global } = useSelector((state) => state.globalSettings)
    const [selectedOptions, setSelectedOptions] = useState([])
    // The modal's scrollable body — used to scroll a required variation group
    // into view from the cart bar prompt.
    const modalScrollRef = useRef(null)
    // Compact header with the food name, shown once the real title has
    // scrolled out of the modal's viewport.
    const [showStickyHeader, setShowStickyHeader] = useState(false)
    const [isLocation, setIsLocation] = useState(false)
    const [totalPrice, setTotalPrice] = useState(null)
    const [modalFor, setModalFor] = useState('sign-in')
    const [variationInCart, setVariationInCart] = useState(false)
    const [add_on, setAddOns] = useState([])
    const { cartList, cartGroups = [] } = useSelector((state) => state.cart)
    // Merge cartList (scoped to the last-visited restaurant after its API
    // returns a flat list) with cartGroups (the grouped multi-restaurant
    // payload). Items added at one restaurant otherwise disappear from this
    // modal's "in cart" checks once a different restaurant is visited.
    // cartList wins on id conflict because it carries pending local edits.
    const effectiveCart = useMemo(() => {
        const fromGroups = (cartGroups || [])
            .flatMap((g) => g?.carts || [])
            .map((c) => ({
                ...c?.item,
                cartItemId: c?.id,
                totalPrice: c?.price,
                quantity: c?.quantity,
                restaurant_id: c?.restaurant_id,
                selectedAddons: getSelectedAddons(c?.item?.addons),
                selectedOptions: getSelectedVariations(c?.item?.variations),
            }))
        const cartListIds = new Set((cartList || []).map((i) => i.id))
        return [
            ...(cartList || []),
            ...fromGroups.filter((g) => !cartListIds.has(g.id)),
        ]
    }, [cartList, cartGroups])
    const [quantity, setQuantity] = useState(1)
    const { token } = useSelector((state) => state.userToken)
    const { wishLists } = useSelector((state) => state.wishList)
    const [modalData, setModalData] = useState([])
    const { mutate: addToCartMutate, isLoading: addToCartLoading } =
        useAddCartItem()
    const { mutate: updateMutate, isLoading: updateToCartLoading } =
        useCartItemUpdate()
    const itemSuccess = (res) => { }
    const {
        data: foodDetails,
        refetch,
        isLoading: itemIsLoading,
        isRefetching,
        error: itemError,
    } = useGetFoodDetails(
        { id: product?.id, campaign },
        itemSuccess,
        productUpdate
    )
    console.log({ itemError });

    const itemNotFound =
        itemError?.response?.status === 404 ||
        itemError?.code === 'ERR_NETWORK'
    console.log({ foodDetails })
    useEffect(() => {
        if (foodDetails) {
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
    }, [foodDetails])
    const isInCartWithVari = useCallback(() => {
        if (!effectiveCart?.length || !foodDetails?.id) {
            setVariationInCart(false);
            setQuantity(1);
            setTotalPrice(foodDetails?.price || 0);
            return;
        }

        const matchedItems = effectiveCart.filter(item => item.id === foodDetails.id);
        if (!matchedItems.length) {
            setVariationInCart(false);
            setQuantity(1);
            setTotalPrice(foodDetails?.price || 0);
            return;
        }

        let matchedItem = null;
        if (foodDetails?.variations?.length > 0 && selectedOptions?.length > 0) {
            matchedItem = matchedItems.find(item => {
                const itemOptions = item.selectedOptions || [];
                if (itemOptions.length !== selectedOptions.length) return false;
                return selectedOptions.every(sel =>
                    itemOptions.some(
                        opt =>
                            opt.option_id === sel.option_id &&
                            opt.label === sel.label
                    )
                );
            });
        }

        else if (!foodDetails?.variations?.length) {
            matchedItem = matchedItems[0];
        }

        if (matchedItem) {
            setModalData([{ ...matchedItem, add_ons: matchedItem?.addons }]);
            setVariationInCart(true);
            setTotalPrice(matchedItem.totalPrice);
            setQuantity(matchedItem.quantity);
        } else {
            setVariationInCart(false);
            setQuantity(1);
            setTotalPrice(foodDetails?.price || 0);
        }
    }, [effectiveCart, foodDetails, selectedOptions]);


    useEffect(() => {
        if (productUpdate) return
        if (foodDetails?.variations?.length > 0) {
            isInCartWithVari();
        } else {
            if (isInCart(foodDetails?.id)) {
                isInCartWithVari();
            } else {
                setVariationInCart(false);
                setQuantity(1);
                setTotalPrice(foodDetails?.price || 0);
            }
        }
    }, [selectedOptions, effectiveCart, productUpdate]);
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
                    itemBasePrice: rawFoodDataNormalize({
                        price: calculateItemBasePrice(
                            modalData[0],
                            selectedOptions
                        ),
                        discount: item?.item?.discount,
                        discount_type: item?.item?.discount_type,
                    }).discountedPrice,
                }
            })
            dispatch(setCart(product))
            refreshCartGroups(dispatch)
            queryClient.refetchQueries('cart-item-restaurant')
            CustomToaster('success', 'Item added to cart')
            handleClose()
        }
    }

    const cartListSuccessHandler = (res) => {
        if (res) {
            dispatch(cart(mapRestaurantCartRows(res)))
            refreshCartGroups(dispatch)
            queryClient.refetchQueries('cart-item-restaurant')
            CustomToaster('success', 'Item updated successfully')
            handleModalClose?.()
        }
    }


    const handleAddUpdate = () => {
        if (productUpdate || variationInCart) {
            console.log({ product })
            const product = effectiveCart.find((item) => item.id === modalData[0]?.id)

            //for updating
            let totalQty = 0
            const itemObject = {
                cart_id: product?.cartItemId,
                guest_id: getGuestId(),
                restaurant_id: product?.restaurant_id,
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
                price: rawFoodDataNormalize(
                    {
                        price: totalPrice,
                        discount: product?.discount,
                        discount_type: product?.discount_type,
                    },
                    quantity
                ).discountedPrice,
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
                ...(reelId != null && { reel_id: reelId }),
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
                restaurant_id: modalData[0]?.restaurant_id,
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
                price: rawFoodDataNormalize(
                    {
                        price: totalPrice,
                        discount: modalData[0]?.discount,
                        discount_type: modalData[0]?.discount_type,
                    },
                    quantity
                ).discountedPrice,
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
                ...(reelId != null && { reel_id: reelId }),
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
        handleAddUpdate()
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
    }, [quantity, modalData, totalPrice])
    const decrementPrice = () => {
        setQuantity((prevQty) => prevQty - 1)
    }

    const incrementPrice = () => {
        console.log("mmm", modalData[0]);

        const isLimitedOrDaily = modalData[0]?.stock_type !== 'unlimited'
        const maxCartQuantity = modalData[0]?.maximum_cart_quantity
        // Helper function to check stock limits and update quantity
        const tryUpdateQuantity = (stockLimit) => {
            if (quantity >= stockLimit && isLimitedOrDaily) {
                CustomToaster('error', t('Out Of Stock'), 'stock')
            } else if (maxCartQuantity && quantity >= maxCartQuantity) {
                CustomToaster(
                    'error',
                    `Max Quantity limits ${maxCartQuantity}`,
                    'Quantity'
                )
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
        const isInCart = effectiveCart.filter((item) => item.id === id)
        return isInCart.length > 0
    }


    const isInList = (id) => {
        return !!wishLists?.food?.find((wishFood) => wishFood.id === id)
    }
    //auth modal
    const [authModalOpen, setAuthModalOpen] = useState(false)

    const orderNow = () => {
        if (location) {
            let checkingFor = 'campaign'
            handleAddToCartOnDispatch(checkingFor)
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
        if (!(modalData[0]?.variations?.length > 0)) return true
        return modalData[0].variations.every((variation, index) => {
            if (variation?.required !== 'on') return true
            const selectedCount =
                selectedOptions?.filter(
                    (item) => item.choiceIndex === index
                )?.length ?? 0
            if (variation?.type === 'multi') {
                return (
                    selectedCount >= Number.parseInt(variation.min) &&
                    selectedCount <= Number.parseInt(variation.max)
                )
            }
            return selectedCount > 0
        })
    }

    // Index of the first required variation group that still needs an answer,
    // or -1 when they are all satisfied.
    const getFirstUnfulfilledVariationIndex = () => {
        if (!(modalData?.[0]?.variations?.length > 0)) return -1
        return modalData[0].variations.findIndex((variation, index) => {
            if (variation?.required !== 'on') return false
            const selectedCount =
                selectedOptions?.filter((item) => item.choiceIndex === index)
                    .length ?? 0
            return variation?.type === 'multi'
                ? selectedCount < (variation?.min ?? 1)
                : selectedCount === 0
        })
    }

    // Bring that group into view inside the modal's own scroll area — the
    // prompt sits in the fixed cart bar, so without this the customer has no
    // hint about which group is blocking them.
    const scrollToRequiredVariation = () => {
        const container = modalScrollRef.current
        if (!container) return
        const index = Math.max(getFirstUnfulfilledVariationIndex(), 0)
        const target = container.querySelector(`#variation-group-${index}`)
        if (!target) return
        const top =
            target.getBoundingClientRect().top -
            container.getBoundingClientRect().top +
            container.scrollTop -
            12
        container.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
        // Flash the group's red outline (styles live on the group box in
        // ChoiceValues). The reflow read restarts the animation when the
        // prompt is clicked repeatedly.
        target.classList.remove('required-blink')
        void target.offsetWidth
        target.classList.add('required-blink')
        setTimeout(() => target.classList.remove('required-blink'), 1300)
    }

    const handleContentScroll = (event) => {
        const container = event.currentTarget
        const title = container.querySelector('#food-modal-title')
        if (!title) return
        setShowStickyHeader(
            title.getBoundingClientRect().bottom <
                container.getBoundingClientRect().top
        )
    }

    const isUpdateDisabled = () => {
        if (selectedOptions && selectedOptions.length > 0) {
            return selectedOptions.some((option) => option.current_stock === 0)
        }
        return false
    }

    const text1 = t('only')
    const text2 = t('items available')
    console.log({ itemNotFound });


    return (
        <>
            <Modal
                open={open}
                onClose={handleModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                disableAutoFocus={true}
            >
                    <FoodDetailModalStyle
                        sx={{
                            bgcolor: 'background.paper',
                            // Flex column so the content area scrolls on its
                            // own while the cart bar sits outside the scroll.
                            maxHeight: { xs: '90vh', sm: '600px' },
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            ...paperSx,
                        }}
                    >
                    {itemNotFound ? (
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            spacing={2.5}
                            sx={{
                                minHeight: { xs: '50vh', md: '45vh' },
                                px: { xs: 3, md: 6 },
                                py: { xs: 4, md: 6 },
                                textAlign: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: (theme) =>
                                        `linear-gradient(135deg, ${alpha(
                                            theme.palette.primary.main,
                                            0.14
                                        )} 0%, ${alpha(
                                            theme.palette.primary.main,
                                            0.04
                                        )} 100%)`,
                                }}
                            >
                                <SentimentDissatisfiedIcon
                                    sx={{
                                        fontSize: 64,
                                        color: 'primary.main',
                                        opacity: 0.85,
                                    }}
                                />
                            </Box>
                            <Stack spacing={0.75} alignItems="center">
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                    color="text.primary"
                                >
                                    {t('Food not found')}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ maxWidth: 360 }}
                                >
                                    {t(
                                        'We could not load this item. It may have been removed or is temporarily unavailable.'
                                    )}
                                </Typography>
                            </Stack>
                            {/* <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ mt: 1 }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={handleModalClose}
                                    sx={{
                                        minWidth: 120,
                                        textTransform: 'none',
                                        borderRadius: 2,
                                    }}
                                >
                                    {t('Close')}
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => refetch()}
                                    sx={{
                                        minWidth: 120,
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        boxShadow: 'none',
                                    }}
                                >
                                    {t('Try Again')}
                                </Button>
                            </Stack> */}
                        </Stack>
                    ) : !itemIsLoading && modalData[0] ? (
                        <>
                            {isLocation ? (
                                <LocationModalAlert
                                    setOpenAddressModalAlert={setOpen}
                                />
                            ) : (
                                <CustomStackFullWidth
                                    sx={{
                                        flex: 1,
                                        minHeight: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {/* Compact header — takes over once the
                                        title scrolls past the top edge. */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            zIndex: 5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 1,
                                            px: { xs: '12px', md: '16px' },
                                            py: '12px',
                                            backgroundColor: 'background.paper',
                                            borderBottom: (th) =>
                                                `1px solid ${th.palette.divider}`,
                                            borderRadius: {
                                                xs: '16px 16px 0 0',
                                                sm: '5px 5px 0 0',
                                            },
                                            opacity: showStickyHeader ? 1 : 0,
                                            visibility: showStickyHeader
                                                ? 'visible'
                                                : 'hidden',
                                            transition: 'opacity .2s ease',
                                        }}
                                    >
                                        <Typography
                                            noWrap
                                            sx={{
                                                fontSize: {
                                                    xs: '16px',
                                                    md: '18px',
                                                },
                                                fontWeight: 700,
                                                color: 'text.primary',
                                            }}
                                        >
                                            {modalData[0]?.name}
                                        </Typography>
                                        <IconButton
                                            onClick={handleModalClose}
                                            aria-label={t('Close')}
                                            sx={{
                                                padding: '4px',
                                                flexShrink: 0,
                                                color: 'text.primary',
                                            }}
                                        >
                                            <CloseIcon
                                                sx={{ fontSize: '20px' }}
                                            />
                                        </IconButton>
                                    </Box>

                                    {/* Scrollable content — scrollbar hidden */}
                                    <Box
                                        ref={modalScrollRef}
                                        onScroll={handleContentScroll}
                                        sx={{
                                            flex: 1,
                                            minHeight: 0,
                                            overflowY: 'auto',
                                            overflowX: 'hidden',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            '&::-webkit-scrollbar': {
                                                display: 'none',
                                            },
                                        }}
                                    >
                                        <FoodModalTopSection
                                            product={modalData[0]}
                                            image={image}
                                            handleModalClose={handleModalClose}
                                            isInList={isInList}
                                            deleteWishlistItem={
                                                deleteWishlistItem
                                            }
                                            addToFavorite={addToFavorite}
                                            global={global}
                                            selectedOptions={selectedOptions}
                                        />

                                        <CustomStackFullWidth
                                            //sx={{ padding: { xs: '10px', md: '5px 12px 12px 12px' } }}
                                            spacing={1}
                                        >

                                        <CustomStackFullWidth spacing={0.25}
                                        sx={{ padding: { xs: '10px', md: '5px 12px 12px 12px' } }}
                                        >
                                            {/* Name, veg + halal icons, rating
                                                    and price all live in
                                                    FoodModalTopSection's info
                                                    card. */}
                                                {/* {quantity >=
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
                                                        )} */}
                                            <FoodDescription
                                                lines={2}
                                                text={
                                                    modalData?.length > 0
                                                        ? modalData[0]
                                                            ?.description
                                                        : ''
                                                }
                                            />
                                            {/* Nutrition + allergen lists — same
                                                label/value shape for both, and
                                                they wrap instead of running off
                                                the modal edge. */}
                                            {[
                                                {
                                                    label: t(
                                                        'Nutrition Details'
                                                    ),
                                                    items: modalData[0]
                                                        ?.nutritions_name,
                                                },
                                                {
                                                    label: t(
                                                        'Allergic Ingredients'
                                                    ),
                                                    items: modalData[0]
                                                        ?.allergies_name,
                                                },
                                            ]
                                                .filter(
                                                    (section) =>
                                                        section.items?.length >
                                                        0
                                                )
                                                .map((section) => (
                                                    <Stack
                                                        key={section.label}
                                                        direction="row"
                                                        flexWrap="wrap"
                                                        alignItems="baseline"
                                                        columnGap={0.5}
                                                        sx={{ mt: '5px' }}
                                                    >
                                                        <Typography
                                                            fontSize="14px"
                                                            fontWeight="500"
                                                        >
                                                            {section.label}:
                                                        </Typography>
                                                        <Typography
                                                            fontSize="12px"
                                                            color={
                                                                theme.palette
                                                                    .neutral[400]
                                                            }
                                                        >
                                                            {section.items.join(
                                                                ', '
                                                            )}
                                                            .
                                                        </Typography>
                                                    </Stack>
                                                ))}
                                            {/* Price moved to
                                                    FoodModalTopSection's info
                                                    card (base/discounted price
                                                    + badges). */}
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
                                                    cartList={effectiveCart}
                                                    itemIsLoading={
                                                        isRefetching
                                                    }
                                                    variationInCart={
                                                        variationInCart
                                                    }
                                                />
                                            )}
                                        </CustomStackFullWidth>
                                    </Box>

                                    {/* Cart bar — outside the scroll area */}
                                    <Box
                                        sx={{
                                            flexShrink: 0,
                                            borderTop: (th) =>
                                                `1px solid ${th.palette.divider}`,
                                            backgroundColor: 'background.paper',
                                            padding: {
                                                xs: '10px',
                                                md: '10px 12px 12px',
                                            },
                                        }}
                                    >
                                        {modalData[0]?.variations?.length > 0 &&
                                        !getFullFillRequirements() ? (
                                            // Nothing else (price, quantity)
                                            // until a required option is picked.
                                            <Button
                                                onClick={
                                                    scrollToRequiredVariation
                                                }
                                                variant="contained"
                                                fullWidth
                                                disableRipple
                                                sx={requiredOptionButtonSx}
                                            >
                                                {t('Choose Required Option')}
                                            </Button>
                                        ) : (
                                        <Grid container direction="row">
                                            <Grid
                                                item
                                                xs={12}
                                                alignSelf="center"
                                                marginBottom="6px"
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
                                                    selectedAddOns={add_on}
                                                    quantity={quantity}
                                                />
                                            </Grid>
                                            <Grid
                                                item
                                                md={4}
                                                sm={4}
                                                xs={5}
                                                alignSelf="center"
                                            >
                                                <IncrementDecrementManager
                                                    decrementPrice={
                                                        decrementPrice
                                                    }
                                                    totalPrice={totalPrice}
                                                    quantity={quantity}
                                                    incrementPrice={
                                                        incrementPrice
                                                    }
                                                    setQuantity={setQuantity}
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
                                                        : 8
                                                }
                                                sm={
                                                    !isAvailable(
                                                        modalData[0]
                                                            ?.available_time_starts,
                                                        modalData[0]
                                                            ?.available_time_ends
                                                    )
                                                        ? 12
                                                        : 8
                                                }
                                                xs={
                                                    !isAvailable(
                                                        modalData[0]
                                                            ?.available_time_starts,
                                                        modalData[0]
                                                            ?.available_time_ends
                                                    )
                                                        ? 12
                                                        : 7
                                                }
                                                alignSelf="center"
                                                sx={{ pl: { xs: 0.75, sm: 1.25 } }}
                                            >
                                                {modalData?.length > 0 &&
                                                    isAvailable(
                                                        modalData[0]
                                                            ?.available_time_starts,
                                                        modalData[0]
                                                            ?.available_time_ends
                                                    ) ? (
                                                    <>
                                                        {(foodDetails?.variations?.length > 0 || product?.variations?.length > 0) ? (
                                                            // 🟦 Case 1: Food has variations
                                                            (variationInCart || productUpdate) ? (
                                                                <UpdateToCartUi
                                                                    addToCard={addToCard}
                                                                    t={t}
                                                                    isLoading={updateToCartLoading}
                                                                />
                                                            ) : (
                                                                <AddOrderToCart
                                                                    addToCartLoading={addToCartLoading}
                                                                    product={modalData?.[0]}
                                                                    t={t}
                                                                    addToCard={addToCard}
                                                                    orderNow={orderNow}
                                                                    getFullFillRequirements={getFullFillRequirements}
                                                                />
                                                            )
                                                        ) : (
                                                            // 🟩 Case 2: Food has NO variations
                                                            (isInCart(modalData[0]?.id)) ? (
                                                                <UpdateToCartUi
                                                                    addToCard={addToCard}
                                                                    t={t}
                                                                    isLoading={updateToCartLoading}
                                                                />
                                                            ) : (
                                                                <AddOrderToCart
                                                                    addToCartLoading={addToCartLoading}
                                                                    product={modalData?.[0]}
                                                                    t={t}
                                                                    addToCard={addToCard}
                                                                    orderNow={orderNow}
                                                                    getFullFillRequirements={getFullFillRequirements}
                                                                />
                                                            )
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
                                        )}
                                    </Box>
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
