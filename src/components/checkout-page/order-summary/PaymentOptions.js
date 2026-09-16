import React, { useEffect, useState } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AddIcon from '@mui/icons-material/Add'
import { CustomPaperBigCard } from '../../../styled-components/CustomStyles.style'
import { useTheme } from '@mui/material/styles'
import CustomModal from '../../custom-modal/CustomModal'
import AllPaymentMethod from '../AllPaymentMethod'
import OfflinePayment from '../assets/OfflinePayment'
import { useDispatch, useSelector } from 'react-redux'
import {
    setOfflineInfoStep,
    setOfflineMethod,
} from '@/redux/slices/OfflinePayment'
import CustomNextImage from '@/components/CustomNextImage'
import { getAmount } from '@/utils/customFunctions'

const PaymentOptions = (props) => {
    const theme = useTheme()
    const {
        global,
        paymenMethod,
        setPaymenMethod,
        subscriptionStates,
        usePartialPayment,
        selected,
        setSelected,
        paymentMethodDetails,
        setPaymentMethodDetails,
        setSwitchToWallet,
        offlinePaymentOptions,
        handlePartialPayment,
        removePartialPayment,
        walletAmount,
        totalAmount,
        switchToWallet,
        setChangeAmount,
        changeAmount,
        orderType,
        openPaymentPrompt,
    } = props
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const [openModal, setOpenModal] = useState(false)
    const { offLineWithPartial } = useSelector((state) => state.offlinePayment)
    const [isCheckedOffline, setIsCheckedOffline] = useState(
        selected?.method === 'offline_payment'
    )
    const { offlineInfoStep } = useSelector((state) => state.offlinePayment)
    useEffect(() => {
        if (offlineInfoStep === 2) {
            dispatch(setOfflineInfoStep(1))
        }
    }, [])
    useEffect(() => {
        if (!selected?.method) {
            setIsCheckedOffline(false)
        }
    }, [selected])

    useEffect(() => {
        if (openPaymentPrompt) {
            setOpenModal(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openPaymentPrompt])

    const getPaymentMethod = (item) => {
        setSelected(item)
        setSwitchToWallet(false)
    }

    const handleClick = () => {
        setOpenModal(true)
    }
    const handleSubmit = () => {
        if (selected?.name === 'wallet') {
            setPaymenMethod(selected?.name)
            setPaymentMethodDetails(selected)
            setOpenModal(false)
            setSwitchToWallet(true)
            dispatch(setOfflineInfoStep(0))
            setIsCheckedOffline(false)
        } else if (selected?.method === 'offline_payment') {
            setPaymenMethod(selected)
            setPaymentMethodDetails(selected)
            dispatch(setOfflineMethod(selected))
            setOpenModal(false)
            setSwitchToWallet(false)
            dispatch(setOfflineInfoStep(1))
            setIsCheckedOffline(true)
        } else {
            setPaymenMethod(selected?.name)
            setPaymentMethodDetails(selected)
            setOpenModal(false)
            setSwitchToWallet(false)
            dispatch(setOfflineInfoStep(0))
            setIsCheckedOffline(false)
        }
    }

    const isSelected = Boolean(paymentMethodDetails?.name)
    const currencySymbol = global?.currency_symbol
    const currencySymbolDirection = global?.currency_symbol_direction
    const digitAfterDecimalPoint = Number.parseInt(
        global?.digit_after_decimal_point,
        10
    )
    // Wallet is applied as a partial payment alongside another method — the
    // summary needs to reflect both, not just whichever was picked last.
    const isWalletPlusOther =
        usePartialPayment &&
        offLineWithPartial &&
        paymentMethodDetails?.name &&
        paymentMethodDetails?.name !== 'wallet'
    const methodLabel = paymentMethodDetails?.method
        ? `${t(
              paymentMethodDetails?.method?.replaceAll('_', ' ')
          )} (${t(paymentMethodDetails?.name)})`
        : `${t(paymentMethodDetails?.name?.replaceAll('_', ' '))}`
    const displayLabel = isWalletPlusOther
        ? `${t('Wallet')} + ${methodLabel}`
        : methodLabel
    // The gateway/COD/offline leg only ever covers what the wallet didn't —
    // showing the full order total here overstates what that method charges.
    const displayAmount = isWalletPlusOther
        ? Math.max(totalAmount - walletAmount, 0)
        : totalAmount

    return (
        <CustomPaperBigCard padding="16px" noboxshadow="true">
            <Stack sx={{ gap: '16px' }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                    justifyContent="space-between"
                    gap={{ xs: '16px', sm: '12px' }}
                >
                    <Stack sx={{ gap: '4px' }}>
                        <Typography
                            sx={{
                                fontSize: '16px',
                                fontWeight: 700,
                                letterSpacing: '-0.48px',
                                color: 'text.primary',
                            }}
                        >
                            {t('Payment Method')}
                        </Typography>
                        <Typography
                            sx={{ fontSize: '13px', color: 'text.secondary' }}
                        >
                            {t('Add at least one option to pay your order.')}
                        </Typography>
                    </Stack>
                    {isSelected ? (
                        <IconButton
                            onClick={handleClick}
                            sx={{
                                display: { xs: 'none', sm: 'inline-flex' },
                                flexShrink: 0,
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                color: 'text.info',
                            }}
                        >
                            <i
                                className="fi fi-rr-pencil"
                                style={{
                                    fontSize: '16px',
                                    lineHeight: 1,
                                    color: 'inherit',
                                }}
                            />
                        </IconButton>
                    ) : (
                        <Box
                            onClick={handleClick}
                            sx={{
                                flexShrink: 0,
                                width: { xs: '100%', sm: 'auto' },
                                cursor: 'pointer',
                                height: { xs: '36px', sm: '40px' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: { xs: '6px', sm: '8px' },
                                px: '24px',
                                borderRadius: '8px',
                                backgroundColor: 'primary.main',
                            }}
                        >
                            <AddIcon
                                sx={{
                                    fontSize: 18,
                                    color: 'primary.contrastText',
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: { xs: '14px', sm: '16px' },
                                    fontWeight: { xs: 600, sm: 700 },
                                    letterSpacing: '-0.48px',
                                    color: 'primary.contrastText',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {t('Add')}
                            </Typography>
                        </Box>
                    )}
                </Stack>

                {isSelected && (
                    <Box
                        onClick={handleClick}
                        sx={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            p: '12px',
                            backgroundColor: (theme) =>
                                theme.palette.neutral[200],
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            gap="12px"
                        >
                            {paymentMethodDetails?.name === 'wallet' ||
                            paymentMethodDetails?.name ===
                                'cash_on_delivery' ? (
                                <CustomNextImage
                                    width="20"
                                    height="32"
                                    objectFit="contain"
                                    src={paymentMethodDetails?.image.src}
                                />
                            ) : (
                                <>
                                    {paymentMethodDetails?.method ===
                                    'offline_payment' ? (
                                        <OfflinePayment />
                                    ) : (
                                        <CustomNextImage
                                            width="20"
                                            height="32"
                                            objectFit="contain"
                                            src={paymentMethodDetails?.image}
                                        />
                                    )}
                                </>
                            )}
                            <Typography
                                noWrap
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    fontSize: '14px',
                                    letterSpacing: '-0.42px',
                                    color: 'text.primary',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {displayLabel}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    letterSpacing: '-0.42px',
                                    color: 'text.primary',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {getAmount(
                                    displayAmount,
                                    currencySymbolDirection,
                                    currencySymbol,
                                    digitAfterDecimalPoint
                                )}
                            </Typography>
                        </Stack>
                    </Box>
                )}
                {openModal && (
                    <CustomModal
                        openModal={openModal}
                        handleClose={() => setOpenModal(false)}
                        setModalOpen={setOpenModal}
                        maxWidth="640px"
                        bgColor={theme.palette.customColor.ten}
                        closeButton
                    >
                        <AllPaymentMethod
                            handleClose={() => setOpenModal(false)}
                            paymenMethod={paymenMethod}
                            usePartialPayment={usePartialPayment}
                            global={global}
                            setPaymenMethod={setPaymenMethod}
                            getPaymentMethod={getPaymentMethod}
                            setSelected={setSelected}
                            selected={selected}
                            handleSubmit={handleSubmit}
                            subscriptionStates={subscriptionStates}
                            offlinePaymentOptions={offlinePaymentOptions}
                            setIsCheckedOffline={setIsCheckedOffline}
                            isCheckedOffline={isCheckedOffline}
                            offLineWithPartial={offLineWithPartial}
                            paymentMethodDetails={paymentMethodDetails}
                            walletAmount={walletAmount}
                            totalAmount={totalAmount}
                            handlePartialPayment={handlePartialPayment}
                            removePartialPayment={removePartialPayment}
                            switchToWallet={switchToWallet}
                            setChangeAmount={setChangeAmount}
                            changeAmount={changeAmount}
                            openModal={openModal}
                            orderType={orderType}
                        />
                    </CustomModal>
                )}
            </Stack>
        </CustomPaperBigCard>
    )
}

PaymentOptions.propTypes = {}

export default PaymentOptions
