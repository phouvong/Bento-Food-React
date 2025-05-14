import React, { useEffect, useState } from 'react'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import {
    Stack,
    styled,
    Button,
    Grid,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Tooltip,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
} from '@mui/material'
import { PymentTitle } from './CheckOut.style'
import { t } from 'i18next'
import { alpha, Typography } from '@mui/material'
import money from './assets/fi_2704332.png'
import wallet from './assets/walletpayment.png'
import CustomImageContainer from '../CustomImageContainer'
import PaymentMethodCard from './PaymentMethodCard'
import { useTheme } from '@emotion/react'
import { PrimaryButton } from '../products-page/FoodOrRestaurant'
import CloseIcon from '@mui/icons-material/Close'
import { useSelector } from 'react-redux'
import InfoIcon from '@mui/icons-material/Info'
import PartialPayment from './PartialPayment'
import { getAmount } from '@/utils/customFunctions'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { getToken } from './functions/getGuestUserId'
import CustomNextImage from '@/components/CustomNextImage'
const PayButton = styled(Button)(({ theme, value, paymentMethod }) => ({
    padding: '16px 16px',
    gap: '10px',
    alignItems: 'center',
    border: '1px solid',
    borderColor: alpha(theme.palette.neutral[400], 0.4),
    color: value === paymentMethod ? theme.palette.neutral[1000] : theme.palette.neutral[1000],
    //background: value === paymentMethod && alpha(theme.palette.primary.main, 0.6),
    '&:hover': {
        color: theme.palette.neutral[1000],
        background: value === paymentMethod && alpha(theme.palette.primary.main, 0.6),
    },
}))

const OfflineButton = styled(Button)(({ theme, value, paymentMethod }) => ({
    padding: '15px 15px',
    borderRadius: '10px',
    fontWeight: '400',
    border: `1px solid ${theme.palette.neutral[300]}`,
    gap: '5px',
    background: value === paymentMethod ? theme.palette.neutral[800] : theme.palette.neutral[100],
    color: value === paymentMethod 
        ? `${theme.palette.whiteContainer.main} !important`
        : `${theme.palette.neutral[1000]} !important`,
    '&:hover': {
        color: `${theme.palette.whiteContainer.main} !important`,
        background: theme.palette.neutral[800],
    },
}))


export const BringChangeAmount = ({changeAmount, setChangeAmount,theme,expanded,setExpanded}) => {
    return (
        <Accordion 
                            elevation={0} 
                            sx={{
                                border: 'none',
                                width: '100%',
                            '&.MuiPaper-root.MuiAccordion-root::before': {
                                display: 'none',
                                height: '0px',
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                zIndex: '1000',
                                backgroundColor: 'transparent',
                            }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={null}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                sx={{
                                    minHeight:'auto',
                                    backgroundColor:theme.palette.customColor.ten,
                                    '&.Mui-expanded': {
                                        minHeight: '0px',
                                        backgroundColor:theme.palette.customColor.ten,
                                    },
                                    '& .MuiAccordionSummary-content': {
                                        justifyContent: 'center',
                                        margin: '0',
                                        backgroundColor:theme.palette.customColor.ten,
                                    }
                                }}
                                onClick={() => setExpanded(!expanded)}
                            >
                                <Typography 
                                    component="span" 
                                    sx={{
                                        fontSize:"12px",
                                        color: theme.palette.primary.main,
                                        fontWeight:"600"
                                    }}
                                >
                                    {expanded ? t("See less") : t("See more")}
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails sx={{padding: '8px 0px 8px',backgroundColor:theme.palette.customColor.ten}}>
                                <Stack 
                                    width="100%"
                                    direction={{xs:"column",md:"row"}}
                                    justifyContent="space-between"
                                    alignItems={{xs:"flex-start",md:"center"}}
                                    gap="10px"
                                    padding="16px"
                                    backgroundColor={theme.palette.mode === 'dark' ? "#46494DB3 " :   alpha(theme.palette.neutral[300], 0.7)}
                                    borderRadius="10px"
                                >
                                    <Stack>
                                        <Typography 
                                            fontSize="12px" 
                                            color={theme.palette.neutral[1000]} 
                                            fontWeight="500"
                                        >
                                            {t("Bring Change Intruction")}
                                        </Typography>
                                        <Typography 
                                            fontSize="12px" 
                                            color={theme.palette.neutral[600]} 
                                            fontWeight="400"
                                        >
                                            {t('Insert amount if you need deliveryman to bring')}
                                        </Typography>
                                    </Stack>

                                    <Stack>
                                        <Typography  
                                            marginBottom="5px" 
                                            fontSize="12px" 
                                            color={theme.palette.neutral[1000]} 
                                            fontWeight="500"
                                        >
                                            {t("Change Amount ($)")}
                                        </Typography>
                                        <TextField
                                            sx={{
                                                width: '100%',
                                                height: '33px',
                                                backgroundColor: theme => theme.palette.neutral[100],
                                                borderRadius: '5px',
                                                '& .MuiInputBase-input.MuiOutlinedInput-input': {
                                                    padding: '5.5px 14px'
                                                }
                                            }}
                                            value={changeAmount}
                                            onChange={(e) => setChangeAmount(e.target.value)}
                                        />
                                    </Stack>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
    )
}

const  AllPaymentMethod = ({
    usePartialPayment,
    global,
    getPaymentMethod,
    selected,
    setSelected,
    handleSubmit,
    subscriptionStates,
    handleClose,
    offlinePaymentOptions,
    setIsCheckedOffline,
    isCheckedOffline,
    offLineWithPartial,
    paymentMethodDetails,
    walletAmount,
    totalAmount,
    handlePartialPayment,
    removePartialPayment,
    switchToWallet,
    paymenMethod,
    setChangeAmount,
    changeAmount
}) => {
    const theme = useTheme()
    const { token } = useSelector((state) => state.userToken)
    const [expanded, setExpanded] = useState(false)
    const [openOfflineOptions, setOpenOfflineOptions] = useState(false)

    useEffect(() => {
        if (paymentMethodDetails !== selected) {
            setSelected(paymentMethodDetails)
        }
        if (isCheckedOffline) {
            setOpenOfflineOptions(true)
        } else {
            setOpenOfflineOptions(false)
        }
    }, [])

    useEffect(() => {
        if (paymentMethodDetails?.method === 'offline_payment') {
            setIsCheckedOffline(true)
        }
    }, [selected])

    const handleClickOffline = () => {
        setOpenOfflineOptions(!openOfflineOptions)
    }

    const handleClickOfflineItem = (item) => {
        setIsCheckedOffline(true)
        getPaymentMethod({
            name: item?.method_name,
            method: 'offline_payment',
            id: item?.id,
        })
    }

    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint

    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }


    return (
        <Stack width="100%" padding="2rem" spacing={2.4}>
            <button className="closebtn" onClick={handleClose}>
                <CloseIcon fontSize="18px" />
            </button>

            <Stack padding="0px 10px">
                <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    gap="10px" 
                    width="100%"
                >
                    <PymentTitle>{t('Payment Method')}</PymentTitle>
                    <Typography 
                        fontSize="12px" 
                        color={theme.palette.neutral[600]} 
                        fontWeight="600"
                    >
                        {t("Total bill")}
                    </Typography>
                </Stack>

                <Stack 
                    direction="row" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    gap="10px" 
                    width="100%"
                >
                    <Typography
                        fontSize="12px"
                        textTransform="capitalize"
                        color={theme.palette.neutral[600]}
                    >
                        {t('Select a Payment Method to Proceed')}
                    </Typography>
                    <Typography 
                        fontSize="20px" 
                        color={theme.palette.primary.main} 
                        fontWeight="700"
                    >
                        {getAmount(
                            totalAmount,
                            currencySymbolDirection,
                            currencySymbol,
                            digitAfterDecimalPoint
                        )}
                    </Typography>
                </Stack>
            </Stack>

            {(global?.partial_payment_status === 1 && usePartialPayment) ? (
                <>
                    <CustomStackFullWidth
                        direction="row"
                        gap="1rem"
                        sx={{
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'start',
                            padding: '0px 10px',
                        }}
                    >
                        <Box sx={{flex: {
                                xs: '0 0 100%',
                                sm: '0 0 48%'
                            }}}>
                            {subscriptionStates.order !== '1' &&
                                global?.customer_wallet_status === 1 &&
                                walletAmount > 0 &&
                                global?.partial_payment_status === 1 && (
                                    <PartialPayment
                                        offLineWithPartial={offLineWithPartial}
                                        global={global}
                                        remainingBalance={walletAmount - totalAmount}
                                        handlePartialPayment={handlePartialPayment}
                                        usePartialPayment={usePartialPayment}
                                        walletBalance={walletAmount}
                                        paymentMethod={paymenMethod}
                                        switchToWallet={switchToWallet}
                                        removePartialPayment={removePartialPayment}
                                        totalAmount={totalAmount}
                                    />
                            )}
                        </Box>

                        <Box sx={{flex: {
                                xs: '0 0 100%',
                                sm: '0 0 48%'
                            }}}>
                            <Stack 
                                backgroundColor={alpha(theme.palette.neutral[500], 0.1)} 
                                padding={paymenMethod === "wallet" ? "18px" : "10px"}
                                borderRadius="10px" 
                                width="100%"
                            >
                                <Stack 
                                    direction="row" 
                                    justifyContent="space-between" 
                                    alignItems="center" 
                                    gap="10px" 
                                    width="100%"
                                >
                                    <Typography 
                                        fontSize="12px" 
                                        color={theme.palette.neutral[600]} 
                                        fontWeight="600"
                                    >
                                        {t('Paid By Wallet')}
                                    </Typography>
                                    <Typography 
                                        fontSize="12px" 
                                        color={theme.palette.neutral[600]} 
                                        fontWeight="500"
                                    >
                                        {getAmount(
                                            paymenMethod === 'wallet' ? totalAmount : walletAmount,
                                            currencySymbolDirection,
                                            currencySymbol,
                                            digitAfterDecimalPoint
                                        )}
                                    </Typography>
                                </Stack>

                                {paymenMethod === "wallet" ? null : (
                                    <Stack 
                                        direction="row" 
                                        justifyContent="space-between" 
                                        alignItems="center" 
                                        gap="10px" 
                                        width="100%"
                                    >
                                        <Typography
                                            fontSize="12px"
                                            textTransform="capitalize"
                                            color={theme.palette.neutral[1000]}
                                            fontWeight="600"
                                        >
                                            {t('Remaining Bill')}
                                        </Typography>
                                        <Typography 
                                            fontSize="18px" 
                                            color={theme.palette.neutral[1000]} 
                                            fontWeight="700"
                                        >
                                            {getAmount(
                                                totalAmount - walletAmount,
                                                currencySymbolDirection,
                                                currencySymbol,
                                                digitAfterDecimalPoint
                                            )}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>

                            {paymenMethod === "wallet" ? null : (
                                <Typography 
                                    fontSize="10px" 
                                    color={theme.palette.error.main} 
                                    fontWeight="400"
                                >
                                    {t("* Please select an option to pay the rest of the amount")}
                                </Typography>
                            )}
                        </Box>

                        <Box sx={{
                            flex: {
                                xs: '0 0 100%',
                                sm: '0 0 48%'
                            }, 
                            marginTop: paymenMethod === "wallet" ? '.5rem' : '-1.2rem'
                        }}>
                            {usePartialPayment ? (
                                <>
                                    {global?.cash_on_delivery &&
                                    (global?.partial_payment_method === 'both' ||
                                        global?.partial_payment_method === 'cod') ? (
                                        <PayButton
                                            value="cash_on_delivery"
                                            paymentMethod={selected?.name}
                                            onClick={() => {
                                                getPaymentMethod({
                                                    name: 'cash_on_delivery',
                                                    image: money,
                                                })
                                            }}
                                            sx={{
                                                width: '100%',
                                            }}  
                                        >
                                            <Stack direction="row" alignItems="center" gap="10px" width="100%" justifyContent="space-between">
                                    {selected?.name === 'cash_on_delivery' && (
                                            <CheckCircleIcon 
                                                sx={{
                                                    fontSize: '16px',
                                                    color: theme.palette.primary.main
                                                }}
                                            />
                                        )}
                                        <Stack direction="row" alignItems="center" gap="10px" alignSelf="flex-start" width="100%"> 
                                        <CustomNextImage
                                            src={money.src}
                                            width="20"
                                            height="20"
                                            alt="cod"
                                        />
                                        <Typography
                                            fontSize="12px"
                                            color={
                                                selected?.name === 'cash_on_delivery'
                                                    ? theme.palette.neutral[1000]
                                                    : theme.palette.primary.main
                                            }
                                        >
                                            {t('Cash on Delivery')}
                                        </Typography>
                                        </Stack>
                                       
                                    </Stack>
                                        </PayButton>
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    {global?.cash_on_delivery ? (
                                        <PayButton
                                            value="cash_on_delivery"
                                            paymentMethod={selected?.name}
                                            onClick={() => {
                                                getPaymentMethod({
                                                    name: 'cash_on_delivery',
                                                    image: money,
                                                })
                                            }}
                                            sx={{
                                                width: '100%',
                                            }}  
                                        >
                                            {selected?.name === 'cash_on_delivery' && (
                                                    <CheckCircleIcon 
                                                        sx={{
                                                            fontSize: '16px',
                                                            color: theme.palette.primary.main
                                                        }}
                                                    />
                                                )}
                                            <Stack direction="row" alignItems="center" gap="10px">
                                                <CustomNextImage
                                                    src={money.src}
                                                    width="20"
                                                    height="20"
                                                    alt="cod"
                                                />
                                                <Typography
                                                    fontSize="12px"
                                                    color={
                                                        selected?.name === 'cash_on_delivery'
                                                            ? theme.palette.neutral[1000]
                                                            : theme.palette.primary.main
                                                    }
                                                >
                                                    {t('Cash on Delivery')}
                                                </Typography>
                                                
                                            </Stack>
                                        </PayButton>
                                    ) : null}
                                </>
                            )}
                        </Box>

                        {selected?.name === "cash_on_delivery" && BringChangeAmount({changeAmount, setChangeAmount,theme,expanded,setExpanded})}
                    </CustomStackFullWidth>

                    {global?.digital_payment && subscriptionStates.order !== '1' && (
                        <CustomStackFullWidth spacing={2.4}>
                            <Typography
                                fontSize="14px"
                                fontWeight="600"
                                color={theme.palette.neutral[1000]}
                            >
                                {t('Pay Via Online')}
                                <Typography
                                    component="span"
                                    fontSize="10px"
                                    ml="5px"
                                    fontWeight="600"
                                    color={theme.palette.neutral[1000]}
                                >
                                    {t('(Faster & secure way to pay bill)')}
                                </Typography>
                            </Typography>

                            <Grid container rowGap="2.1rem">
                                {(
                                    (global?.digital_payment && 
                                     (global?.partial_payment_method === 'digital_payment' || 
                                      global?.partial_payment_method === 'both'))) && (
                                    <>
                                        {global?.active_payment_method_list?.map(
                                            (item, index) => {
                                                return (
                                                    <Grid item md={6} key={index}>
                                                        <PaymentMethodCard
                                                            paymentType={item?.gateway_title}
                                                            image={item?.gateway_image_full_url}
                                                            type={item?.gateway}
                                                            imageUrl={global?.base_urls?.gateway_image_url}
                                                            digitalPaymentMethodActive={global?.digital_payment}
                                                            getPaymentMethod={getPaymentMethod}
                                                            selected={selected}
                                                        />
                                                    </Grid>
                                                )
                                            }
                                        )}
                                    </>
                                )}
                            </Grid>
                        </CustomStackFullWidth>
                    )}
                </>
            ) : (
                <>
                    <CustomStackFullWidth
                        direction="row"
                        gap="1rem"
                        sx={{
                            flexWrap: 'wrap',
                            flexGrow: 1,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0px 10px',
                        }}
                    >
                       
                            {subscriptionStates.order !== '1' &&
                                global?.customer_wallet_status === 1 &&
                                walletAmount > 0 &&
                                global?.partial_payment_status === 1 && (
                                    <Box sx={{flex: {
                                        xs: '0 0 100%',
                                        sm: '0 0 48%'
                                    }}}>
                                    <PartialPayment
                                        offLineWithPartial={offLineWithPartial}
                                        global={global}
                                        remainingBalance={walletAmount - totalAmount}
                                        handlePartialPayment={handlePartialPayment}
                                        usePartialPayment={usePartialPayment}
                                        walletBalance={walletAmount}
                                        paymentMethod={paymenMethod}
                                        switchToWallet={switchToWallet}
                                        removePartialPayment={removePartialPayment}
                                        totalAmount={totalAmount}
                                    />
                                     </Box>
                            )}
                       

                        {paymenMethod === "wallet" && switchToWallet ? (
                            <Box sx={{flex: {
                                xs: '0 0 100%',
                                sm: '0 0 48%'
                            }}}>
                                <Stack 
                                    backgroundColor={alpha(theme.palette.neutral[500], 0.1)} 
                                    padding="18px" 
                                    borderRadius="10px" 
                                    width="100%"
                                >
                                    <Stack 
                                        direction="row" 
                                        justifyContent="space-between" 
                                        alignItems="center" 
                                        gap="10px" 
                                        width="100%"
                                    >
                                        <Typography 
                                            fontSize="12px" 
                                            color={theme.palette.neutral[600]} 
                                            fontWeight="600"
                                        >
                                            {t('Paid By Wallet')}
                                        </Typography>
                                        <Typography 
                                            fontSize="12px" 
                                            color={theme.palette.neutral[600]} 
                                            fontWeight="500"
                                        >
                                            {getAmount(
                                                totalAmount,
                                                currencySymbolDirection,
                                                currencySymbol,
                                                digitAfterDecimalPoint
                                            )}
                                        </Typography>
                                    </Stack>
                                    <Stack 
                                        direction="row" 
                                        justifyContent="space-between" 
                                        alignItems="center" 
                                        gap="10px" 
                                        width="100%"
                                    />
                                </Stack>
                            </Box>
                        ) : null}

                        <Box sx={{
                            flex: {
                                xs: '0 0 100%',
                                sm: '0 0 48%'
                            }
                        }}>
                            {global?.cash_on_delivery ? (
                                <PayButton
                                    value="cash_on_delivery"
                                    paymentMethod={selected?.name}
                                    onClick={() => {
                                        getPaymentMethod({
                                            name: 'cash_on_delivery',
                                            image: money,
                                        })
                                    }}
                                    sx={{
                                        width: '100%',
                                        
                                    }}
                                >
                                     


                                    <Stack direction="row" alignItems="center" gap="10px" width="100%" justifyContent="space-between">
                                    {selected?.name === 'cash_on_delivery' && (
                                            <CheckCircleIcon 
                                                sx={{
                                                    fontSize: '16px',
                                                    color: theme.palette.primary.main
                                                }}
                                            />
                                        )}
                                        <Stack direction="row" alignItems="center" gap="10px" alignSelf="flex-start" width="100%"> 
                                        <CustomNextImage
                                            src={money.src}
                                            width="20"
                                            height="20"
                                            alt="cod"
                                        />
                                        <Typography
                                            fontSize="12px"
                                            color={
                                                selected?.name === 'cash_on_delivery'
                                                    ? theme.palette.neutral[1000]
                                                    : theme.palette.primary.main
                                            }
                                        >
                                            {t('Cash on Delivery')}
                                        </Typography>
                                        </Stack>
                                       
                                    </Stack>
                                </PayButton>
                            ) : null}
                        </Box>
                    </CustomStackFullWidth>

                    {selected?.name === "cash_on_delivery" && BringChangeAmount({changeAmount, setChangeAmount,theme,expanded,setExpanded})}

                    {global?.digital_payment && subscriptionStates.order !== '1' && (
                        <CustomStackFullWidth spacing={2.4} padding="0px 10px">
                            <Typography
                                fontSize="14px"
                                fontWeight="600"
                                color={theme.palette.neutral[1000]}
                            >
                                {t('Pay Via Online')}
                                <Typography
                                    component="span"
                                    fontSize="10px"
                                    ml="5px"
                                    fontWeight="600"
                                    color={theme.palette.neutral[1000]}
                                >
                                    {t('(Faster & secure way to pay bill)')}
                                </Typography>
                            </Typography>

                            <Grid container rowGap="2.1rem">
                                {global?.digital_payment && (
                                    <>
                                        {global?.active_payment_method_list?.map(
                                            (item, index) => {
                                                return (
                                                    <Grid item md={6}>
                                                        <PaymentMethodCard
                                                            key={index}
                                                            paymentType={item?.gateway_title}
                                                            image={item?.gateway_image_full_url}
                                                            type={item?.gateway}
                                                            imageUrl={global?.base_urls?.gateway_image_url}
                                                            digitalPaymentMethodActive={global?.digital_payment}
                                                            getPaymentMethod={getPaymentMethod}
                                                            selected={selected}
                                                        />
                                                    </Grid>
                                                )
                                            }
                                        )}
                                    </>
                                )}
                            </Grid>
                        </CustomStackFullWidth>
                    )}
                </>
            )}

            {global?.offline_payment_status === 1 &&
                typeof offlinePaymentOptions !== 'undefined' &&
                Object?.keys(offlinePaymentOptions)?.length !== 0 &&
                subscriptionStates.order !== '1' && (
                    <CustomStackFullWidth
                        padding="10px 10px 10px 15px"
                        borderRadius="10px"
                        backgroundColor={alpha(theme.palette.primary.main, 0.1)}
                    >
                        <CustomStackFullWidth gap="15px">
                            <CustomStackFullWidth
                                flexDirection="row"
                                justifyContent="space-between"
                            >
                                <FormControl
                                    sx={{
                                        marginRight: { xs: '0px' },
                                        marginLeft: { xs: '5px' },
                                    }}
                                >
                                    <RadioGroup
                                        aria-labelledby="demo-radio-buttons-group-label"
                                        name="radio-buttons-group"
                                        fontWeight="600"
                                    >
                                        <FormControlLabel
                                            sx={{
                                                color: (theme) => theme.palette.neutral[1000],
                                            }}
                                            value="Pay Offline"
                                            control={
                                                <Radio
                                                    sx={{
                                                        padding: {
                                                            xs: '2px',
                                                            md: '10px',
                                                        },
                                                    }}
                                                    checked={isCheckedOffline}
                                                    onClick={handleClickOffline}
                                                />
                                            }
                                            label={
                                                <Typography
                                                    fontSize="14px"
                                                    fontWeight="500"
                                                >
                                                    {t('Pay Offline')}
                                                    <Typography
                                                        component="span"
                                                        fontSize="10px"
                                                        ml="5px"
                                                        color={theme.palette.neutral[1000]}
                                                    >
                                                        ({t('Select option from below')})
                                                    </Typography>
                                                </Typography>
                                            }
                                        />
                                    </RadioGroup>
                                </FormControl>

                                <Tooltip
                                    placement="left"
                                    title={t(
                                        "Offline Payment! Now, with just a click of a button, you can make secure transactions. It's simple, convenient, and reliable."
                                    )}
                                >
                                    <InfoIcon
                                        fontSize="16px"
                                        sx={{
                                            color: theme.palette.primary.main,
                                        }}
                                    />
                                </Tooltip>
                            </CustomStackFullWidth>

                            {openOfflineOptions && (
                                <CustomStackFullWidth paddingBottom="10px">
                                    <CustomStackFullWidth
                                        direction="row"
                                        gap="10px"
                                        sx={{ flexWrap: 'wrap' }}
                                    >
                                        {offlinePaymentOptions?.map(
                                            (item, index) => {
                                                return (
                                                    <OfflineButton
                                                        key={index}
                                                        value={item?.method_name}
                                                        paymentMethod={selected?.name}
                                                        onClick={() => handleClickOfflineItem(item)}
                                                    >
                                                        {item.method_name}
                                                    </OfflineButton>
                                                )
                                            }
                                        )}
                                    </CustomStackFullWidth>
                                </CustomStackFullWidth>
                            )}
                        </CustomStackFullWidth>
                    </CustomStackFullWidth>
                )}

            <Stack paddingTop="30px">
                <PrimaryButton variant="contained" onClick={handleSubmit}>
                    {t('Select')}
                </PrimaryButton>
            </Stack>
        </Stack>
    )
}

export default AllPaymentMethod
