import { useTranslation } from 'react-i18next'
import {
    alpha,
    Grid,
    InputAdornment,
    Typography,
    useTheme,
} from '@mui/material'
import React from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import CustomDivider from '../CustomDivider'
import CustomPhoneInput from '../CustomPhoneInput'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
const OwnerForm = ({
    RestaurantJoinFormik,
    fNameHandler,
    lNameHandler,
    phoneHandler,
    configData,
}) => {
    const theme = useTheme()
    const { t } = useTranslation()
    return (
        <CustomStackFullWidth>
            <Typography
                fontSize="18px"
                fontWeight="500"
                sx={{
                    borderBottom: (theme) =>
                        `1px solid ${alpha(theme.palette.neutral[400], 0.3)}`,
                    p: '1rem',
                    color: (theme) => theme.palette.neutral[1000],
                }}
            >
                {t('Owner Info')}
            </Typography>
            <Grid container spacing={3} sx={{ p: '1rem' }}>
                <Grid item xs={12} md={12} align="left">
                    <CustomDivider border="1px" paddingTop="5px" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <CustomTextFieldWithFormik
                        placeholder={t('First Name')}
                        required="true"
                        type="text"
                        label={t('First Name')}
                        touched={RestaurantJoinFormik.touched.f_name}
                        errors={RestaurantJoinFormik.errors.f_name}
                        fieldProps={RestaurantJoinFormik.getFieldProps(
                            'f_name'
                        )}
                        borderRadius="8px"
                        onChangeHandler={fNameHandler}
                        value={RestaurantJoinFormik.values.f_name}
                        fontSize="12px"
                        startIcon={
                            <InputAdornment position="start">
                                <AccountCircleIcon
                                    sx={{
                                        color:
                                            RestaurantJoinFormik.touched
                                                .restaurant_name &&
                                            !RestaurantJoinFormik.errors
                                                .restaurant_name
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
                <Grid item xs={12} sm={6} md={4}>
                    <CustomTextFieldWithFormik
                        required="true"
                        type="text"
                        placeholder={t('Last Name')}
                        label={t('Last Name')}
                        touched={RestaurantJoinFormik.touched.l_name}
                        errors={RestaurantJoinFormik.errors.l_name}
                        fieldProps={RestaurantJoinFormik.getFieldProps(
                            'l_name'
                        )}
                        borderRadius="8px"
                        onChangeHandler={lNameHandler}
                        value={RestaurantJoinFormik.values.l_name}
                        fontSize="12px"
                        startIcon={
                            <InputAdornment position="start">
                                <AccountCircleIcon
                                    sx={{
                                        color:
                                            RestaurantJoinFormik.touched
                                                .restaurant_name &&
                                            !RestaurantJoinFormik.errors
                                                .restaurant_name
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
                <Grid item xs={12} sm={6} md={4}>
                    <CustomPhoneInput
                        initCountry={configData?.country}
                        value={RestaurantJoinFormik.values.phone}
                        onHandleChange={phoneHandler}
                        touched={RestaurantJoinFormik.touched.phone}
                        errors={RestaurantJoinFormik.errors.phone}
                        // lanDirection={lanDirection}
                        height="45px"
                        borderradius="8px"
                    />
                </Grid>
            </Grid>
        </CustomStackFullWidth>
    )
}
export default OwnerForm
