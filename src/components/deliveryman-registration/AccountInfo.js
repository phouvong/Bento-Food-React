import { alpha, Grid, InputAdornment } from '@mui/material'
import CustomSelectWithFormik from '../custom-select/CustomSelectWithFormik'

import { t } from 'i18next'
import RoomIcon from '@mui/icons-material/Room'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'

import HttpsIcon from '@mui/icons-material/Https'
import { useTheme } from '@emotion/react'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import CustomPhoneInput from '../CustomPhoneInput'
import { formatPhoneNumber } from '@/utils/customFunctions'
const AccountInfo = ({
    configData,
    deliveryManFormik,
    phoneNumberHandler,
    passwordHandler,
    handleFieldChange,
}) => {
    const theme = useTheme()
    // const lanDirection = getLanguage() ? getLanguage() : "ltr";

    return (
        <>
            <Grid container spacing={3}>
                <Grid item xs={12} lg={4}>
                    <CustomPhoneInput
                        value={deliveryManFormik.values.phone}
                        onHandleChange={(value) => {
                            handleFieldChange('phone', formatPhoneNumber(value))
                        }}
                        initCountry={configData?.country}
                        touched={deliveryManFormik.touched.phone}
                        errors={deliveryManFormik.errors.phone}
                        rtlChange="true"
                        borderradius="10px"
                        height="45px"
                    />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <CustomTextFieldWithFormik
                        placeholder={t('Password')}
                        name="password"
                        type="password"
                        label={t('Password')}
                        onChangeHandler={(value) => {
                            handleFieldChange('password', value)
                        }}
                        touched={deliveryManFormik.touched.password}
                        errors={deliveryManFormik.errors.password}
                        fieldProps={deliveryManFormik.getFieldProps('password')}
                        // onChangeHandler={restaurantNameHandler}
                        borderRadius="10px"
                        value={deliveryManFormik.values.password}
                        fontSize="12px"
                        startIcon={
                            <InputAdornment position="start">
                                <HttpsIcon
                                    sx={{
                                        color:
                                            deliveryManFormik.touched
                                                .password &&
                                            !deliveryManFormik.errors.password
                                                ? theme.palette.primary.main
                                                : alpha(
                                                      theme.palette
                                                          .neutral[400],
                                                      0.7
                                                  ),
                                        fontSize: '18px',
                                    }}
                                />
                            </InputAdornment>
                        }
                    />
                </Grid>
                <Grid item xs={12} lg={4}>
                    <CustomTextFieldWithFormik
                        placeholder={t('Confirm Password')}
                        name="confirm_password"
                        type="password"
                        label={t('Confirm Password')}
                        borderRadius="10px"
                        onChangeHandler={(value) => {
                            handleFieldChange('confirm_password', value)
                        }}
                        touched={deliveryManFormik.touched.confirm_password}
                        errors={deliveryManFormik.errors.confirm_password}
                        fieldProps={deliveryManFormik.getFieldProps(
                            'confirm_password'
                        )}
                        value={deliveryManFormik.values.confirm_password}
                        fontSize="12px"
                        startIcon={
                            <InputAdornment position="start">
                                <HttpsIcon
                                    sx={{
                                        fontSize: '18px',
                                    }}
                                />
                            </InputAdornment>
                        }
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default AccountInfo
