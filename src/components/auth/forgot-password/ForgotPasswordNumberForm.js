
import React, { useEffect } from 'react'
import { alpha, Button, Stack, Typography, useTheme } from '@mui/material'
import { useFormik } from 'formik'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import { useTranslation } from 'react-i18next'
import CustomPhoneInput from '../../CustomPhoneInput'
import { useSelector } from 'react-redux'
import LoadingButton from '@mui/lab/LoadingButton'
import { useForgotPassword } from '@/hooks/react-query/config/forgot-password/useForgotPassword'
import * as Yup from 'yup'
import toast from 'react-hot-toast'
import { onErrorResponse } from '../../ErrorResponse'
import forgotPasswordImage from '../../../assets/images/forgotPasswordImage.svg'
import CustomImageContainer from '../../CustomImageContainer'
import { PrimaryButton } from '@/components/products-page/FoodOrRestaurant'
import CustomTextFieldWithFormik from '@/components/form-fields/CustomTextFieldWithFormik'
import InputAdornment from '@mui/material/InputAdornment'
import PhoneOrEmailIcon from '@/components/auth/PhoneOrEmailIcon'
import Skeleton from '@mui/material/Skeleton'
import simage from "../../../../public/gotosupport.png"

const ForgotPasswordNumberForm = ({
    data,
    goNext,
    handleFirstForm,
    setModalFor,
    sendOTP,formSubmitHandlerSendOtp
,isLoading
    ,setHasVerificationMethod,
    setPhoneOrEmail,
                                      phoneOrEmail,
                                      hasVerificationMethod
}) => {
    const { t } = useTranslation()
    const theme = useTheme()

    const { global } = useSelector((state) => state.globalSettings)
    useEffect(() => {
        const { centralize_login,is_mail_active,is_sms_active,firebase_otp_verification
        } = global || {};
        if (centralize_login) {
            const { phone_verification_status, email_verification_status } =
                centralize_login;
            if(is_mail_active && is_sms_active){
                setHasVerificationMethod(true)
                setPhoneOrEmail("phone")
            }else if(firebase_otp_verification){
                setHasVerificationMethod(true)
                setPhoneOrEmail("phone")
            }
            else if (is_sms_active) {
                setHasVerificationMethod(true)
                setPhoneOrEmail("phone");
            } else if (is_mail_active) {
                setHasVerificationMethod(true)
                setPhoneOrEmail("email");
            }

            else{
                setHasVerificationMethod(false)
            }
        }
    }, [global]);
    const phoneFormik = useFormik({
        initialValues: {
            phone: phoneOrEmail==="phone"?data ? data.phone : "":"",
            email:phoneOrEmail==="email"?data? data?.email:"":"",
            verification_method:phoneOrEmail
        },
        validationSchema: Yup.object({
            phone: Yup.string().when('verification_method', {
                is: phoneOrEmail==="phone",
                then: (schema) =>
                    schema
                        .required(t("Please provide a phone number"))
                        .matches(/^\d{10}$/, t("Phone number must be exactly 10 digits")),
                otherwise: (schema) => schema.notRequired(),
            }),
            email: Yup.string().when('verification_method', {
                is: phoneOrEmail==="email",
                then: (schema) =>
                    schema
                        .required(t("Please provide an email address"))
                        .email(t("Please enter a valid email address")),
                otherwise: (schema) => schema.notRequired(),
            }),
        }),
        onSubmit: async (values, helpers) => {
            try {
                formSubmitHandlerSendOtp({ ...values,verification_method:phoneOrEmail })
            } catch (err) {}
        },
    })


    const handleOnChange = (value) => {
        phoneFormik.setFieldValue('phone', `+${value}`)
    }
    const handleEmailChange=(value)=>{
        phoneFormik.setFieldValue("email",value)
    }
    const handleSupport = () => {
        window.open("/help-and-support", "_blank");
    };
    const text1=t("Please enter the registered")
    const text2=t("where you want to sent your password recovery OTP.")

    return (
       <>

               <Stack>
                   {hasVerificationMethod? ( <CustomStackFullWidth
                       alignItems="center"
                       gap="20px"
                       maxWidth="340px"
                   >
                       <CustomImageContainer
                           src={forgotPasswordImage.src}
                           alt="logo"
                           width="160px"
                           objectFit="contained"
                       />
                       <Typography
                           fontSize="16px"
                           fontWeight={600}
                           sx={{ color: theme.palette.text.formHeader }}
                       >
                           {t('Forgot Password')}
                       </Typography>
                       <Typography
                           fontSize="14px"
                           sx={{
                               textAlign: 'center',
                               color: theme.palette.neutral[600],
                           }}
                       >
                           {t(
                               `Don’t worry! Give your registered ${phoneOrEmail==="phone"?"phone number":"email"} & get OTP to update your password.`
                           )}
                       </Typography>
                       <CustomStackFullWidth>
                           <form noValidate onSubmit={phoneFormik.handleSubmit}>
                               <>
                                   {phoneOrEmail === "phone" ? (  <CustomPhoneInput
                                       value={phoneFormik.values.phone}
                                       onHandleChange={handleOnChange}
                                       initCountry={global?.country}
                                       touched={phoneFormik.touched.phone}
                                       errors={phoneFormik.errors.phone}
                                       rtlChange="true"
                                   />):(
                                       <CustomTextFieldWithFormik
                                           name="email"
                                           label={t("Email")}
                                           placeholder={t("Enter email")}
                                           touched={phoneFormik.touched.email}
                                           errors={phoneFormik.errors.email}
                                           fieldProps={phoneFormik.getFieldProps("email")}
                                           onChangeHandler={handleEmailChange}
                                           value={phoneFormik.values.email}
                                           height="45px"
                                           borderRadius="10px"
                                           startIcon={
                                               <InputAdornment position="start">
                                                   <PhoneOrEmailIcon
                                                       sx={{
                                                           color:
                                                               alpha(theme.palette.neutral[500], 0.4)
                                                       }}
                                                   />
                                               </InputAdornment>
                                           }
                                       />
                                   )}
                               </>

                               <LoadingButton
                                   type="submit"
                                   fullWidth
                                   variant="contained"
                                   sx={{ mt: 3, mb: 2 }}
                                   loading={isLoading}
                               >
                                   {t('GET OTP')}
                               </LoadingButton>
                               <Stack mt="10px">
                                   <Typography
                                       textAlign="center"
                                       sx={{
                                           cursor: 'pointer',
                                           color: theme.palette.neutral[500],
                                           '&:hover': {
                                               color: theme.palette.primary.main,
                                           },
                                       }}
                                       onClick={() => {
                                           setModalFor('sign-in')
                                           // goNext()
                                       }}
                                   >
                                       {t('Go Back')}
                                   </Typography>
                               </Stack>
                           </form>
                       </CustomStackFullWidth>
                   </CustomStackFullWidth>):(
                       <Stack width="100%" justifyContent="center" alignItems="center" spacing={2}>
                           <CustomImageContainer
                               src={simage.src}
                               alt="logo"
                               width="100px"
                               height="100px"
                               sx={{ borderRadius: "50%", marginBottom: "1rem" }}
                           />
                           <Typography  fontSize="20px" fontWeight="700">{t("Sorry, Something Went Wrong")}</Typography>
                           <Typography textAlign="center" fontSize="14px" color={alpha(theme.palette.neutral[400],.7)}>{t("Please try again after some time or Contact with our support team.")}</Typography>

                           <Button variant="contained" onClick={handleSupport}>
                               {t("Help & Support")}
                           </Button>
                       </Stack>
                   )}

               </Stack>

       </>
    )
}
export default ForgotPasswordNumberForm
