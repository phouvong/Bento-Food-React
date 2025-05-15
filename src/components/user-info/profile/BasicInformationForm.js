import React, { useRef } from 'react'
import { Box, Grid, Stack, useMediaQuery } from '@mui/material'
import {
    ButtonBox,
    CancelButton,
    CustomDivWithBorder,
    CustomProfileTextfield,
    SaveButton,
} from './Profile.style'
import { useFormik } from 'formik'
import ValidationSechemaProfile from './Validation'
import ImageUploaderWithPreview from '../../single-file-uploader-with-preview/ImageUploaderWithPreview'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import VerifiedIcon from '@/components/user-info/profile/VerifiedIcon'
import CustomModal from '@/components/custom-modal/CustomModal'
import OtpForm from '@/components/auth/forgot-password/OtpForm'

const BasicInformationForm = ({
    data,
    formSubmit,
    open,
    setOpen,
    setOpenEmail,
    openEmail,
    resData,
    handleCloseEmail,
    handleClosePhone,
}) => {
    const imageContainerRef = useRef()
    const theme = useTheme()
    const isXSmall = useMediaQuery(theme.breakpoints.down('sm'))
    const { t } = useTranslation()
    let { f_name, l_name, phone, email, image_full_url } = data
    const { global } = useSelector((state) => state.globalSettings)
    const customerImageUrl = global?.base_urls?.customer_image_url
    const profileFormik = useFormik({
        initialValues: {
            name: f_name ? `${f_name} ${l_name}` : '',
            email: email ? email : '',
            phone: phone ? phone : '',
            image: image_full_url ? image_full_url : '',
            password: '',
            confirm_password: '',
        },
        validationSchema: ValidationSechemaProfile(),
        onSubmit: async (values) => {
            try {
                formSubmitOnSuccess(values)
            } catch (err) {}
        },
    })
    const formSubmitOnSuccess = (values) => {
        formSubmit(values)
    }
    const singleFileUploadHandlerForImage = (value) => {
        profileFormik.setFieldValue('image', value.currentTarget.files[0])
    }
    const imageOnchangeHandlerForImage = (value) => {
        profileFormik.setFieldValue('image', value)
    }
    const handleReset = () => {
        profileFormik.setValues({
            name: f_name ? `${f_name}${l_name}` : '',
            email: email ? email : '',
            phone: phone ? phone : '',
            image: imaimage_full_urlge ? image_full_url : '',
        })
    }
    const handleVerified = (type) => {
        if (type === 'email') {
            formSubmit({ ...profileFormik?.values, button_type: 'email' })
        } else {
            formSubmit({ ...profileFormik?.values, button_type: 'phone' })
        }
    }
    return (
        <CustomDivWithBorder isXSmall={isXSmall}>
            <form noValidate onSubmit={profileFormik.handleSubmit}>
                <Grid container md={12} xs={12}>
                    <Grid
                        item
                        md={3}
                        xs={12}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Stack
                            sx={{
                                position: 'relative',
                                width: '147px',
                                borderRadius: '50%',
                                marginLeft: { xs: 0, md: '-25px' },
                            }}
                        >
                            <ImageUploaderWithPreview
                                type="file"
                                labelText={t('Upload your photo')}
                                hintText="Image format - jpg, png, jpeg, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                                file={profileFormik.values.image}
                                isIcon
                                onChange={singleFileUploadHandlerForImage}
                                imageOnChange={imageOnchangeHandlerForImage}
                                width="10.75rem"
                                imageUrl={customerImageUrl}
                                borderRadius="20px"
                            />

                            {profileFormik.values.image && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: '14%',
                                        right: '-5px',
                                        height: '38px',
                                        width: '38px',
                                        borderRadius: '50%',
                                        background: (theme) =>
                                            theme.palette.neutral[100],
                                    }}
                                >
                                    <IconButton
                                        onClick={() =>
                                            imageContainerRef.current.click()
                                        }
                                    >
                                        <CreateOutlinedIcon
                                            sx={{
                                                color: theme.palette.info.main,
                                            }}
                                        />
                                    </IconButton>
                                    <input
                                        ref={imageContainerRef}
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={(e) => {
                                            singleFileUploadHandlerForImage(e)
                                        }}
                                    />
                                </Box>
                            )}
                        </Stack>
                    </Grid>
                    <Grid item container md={9} xs={12} spacing={2}>
                        <Grid item md={12} xs={12}>
                            <CustomProfileTextfield
                                id="outlined-basic"
                                variant="outlined"
                                name="name"
                                value={profileFormik.values.name}
                                onChange={profileFormik.handleChange}
                                label={t('Name')}
                                required
                                error={
                                    profileFormik.touched.name &&
                                    Boolean(profileFormik.errors.name)
                                }
                                helperText={
                                    profileFormik.touched.name &&
                                    profileFormik.errors.name
                                }
                                touched={profileFormik.touched.name}
                            />
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <Stack position="relative">
                                <CustomProfileTextfield
                                    label={
                                        <span>
                                            {t('Phone')}{' '}
                                            {data?.is_phone_verified === 1 && (
                                                <>
                                                    <span
                                                        style={{ color: 'red' }}
                                                    >
                                                        ({t('Not Changeable')})
                                                    </span>{' '}
                                                </>
                                            )}
                                        </span>
                                    }
                                    variant="outlined"
                                    sx={{ width: '100%' }}
                                    InputProps={{
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*',
                                    }}
                                    disabled={data?.is_phone_verified === 1}
                                    name="phone"
                                    value={profileFormik.values.phone}
                                    onChange={(e) => {
                                        let inputValue = e.target.value

                                        // Allow + at the beginning and remove all non-numeric characters after the first position
                                        if (inputValue[0] === '+') {
                                            inputValue = `+${inputValue
                                                .slice(1)
                                                .replace(/\D/g, '')}`
                                        } else {
                                            inputValue = inputValue.replace(
                                                /\D/g,
                                                ''
                                            ) // Remove all non-numeric characters
                                        }

                                        profileFormik.setFieldValue(
                                            'phone',
                                            inputValue
                                        )
                                    }}
                                    onBlur={profileFormik.handleBlur}
                                    error={
                                        profileFormik.touched.phone &&
                                        Boolean(profileFormik.errors.phone)
                                    }
                                    helperText={
                                        profileFormik.touched.phone &&
                                        profileFormik.errors.phone
                                    }
                                    type="tel"
                                />
                                <Stack
                                    sx={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '12px',
                                    }}
                                >
                                    {data?.is_phone_verified === 1 ? (
                                        <VerifiedIcon />
                                    ) : (
                                        <>
                                            {global?.centralize_login
                                                ?.phone_verification_status ===
                                                1 && (
                                                <ReportProblemIcon
                                                    onClick={() =>
                                                        handleVerified('phone')
                                                    }
                                                    sx={{
                                                        color: (theme) =>
                                                            theme.palette.error
                                                                .pureRed,
                                                        width: '1.2rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            )}
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        </Grid>
                        <Grid item md={6} xs={12}>
                            <Stack position="relative">
                                <CustomProfileTextfield
                                    id="outlined-basic"
                                    variant="outlined"
                                    name="email"
                                    value={profileFormik.values.email}
                                    onChange={profileFormik.handleChange}
                                    label={t('Email')}
                                    required
                                    error={
                                        profileFormik.touched.email &&
                                        Boolean(profileFormik.errors.email)
                                    }
                                    helperText={
                                        profileFormik.touched.email &&
                                        profileFormik.errors.email
                                    }
                                    touched={profileFormik.touched.email}
                                />
                                <Stack
                                    sx={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '12px',
                                    }}
                                >
                                    {data?.is_email_verified === 1 ? (
                                        <VerifiedIcon />
                                    ) : (
                                        <>
                                            {global?.centralize_login
                                                ?.email_verification_status ===
                                                1 && (
                                                <ReportProblemIcon
                                                    onClick={() =>
                                                        handleVerified('email')
                                                    }
                                                    sx={{
                                                        color: (theme) =>
                                                            theme.palette.error
                                                                .pureRed,
                                                        width: '1.2rem',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            )}
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Grid
                        item
                        md={12}
                        xs={12}
                        display="flex"
                        flexDirection="row"
                        gap="10px"
                        justifyContent="flex-end"
                        pt={{ xs: '20px', md: 0 }}
                    >
                        <CancelButton variant="outlined" onClick={handleReset}>
                            {t('Reset')}
                        </CancelButton>
                        <ButtonBox>
                            <SaveButton variant="contained" type="submit">
                                {t('Update Profile')}
                            </SaveButton>
                        </ButtonBox>
                    </Grid>
                </Grid>
            </form>
            {open && (
                <CustomModal openModal={open} setModalOpen={setOpen}>
                    <OtpForm
                        data={data?.phone}
                        handleClose={handleClosePhone}
                        formSubmitHandler={formSubmit}
                        loginValue={resData}
                        reSendOtp={formSubmit}
                    />
                </CustomModal>
            )}
            {openEmail && (
                <CustomModal openModal={openEmail} setModalOpen={setOpenEmail}>
                    <OtpForm
                        data={data?.email}
                        handleClose={handleCloseEmail}
                        formSubmitHandler={formSubmit}
                        loginValue={resData}
                        reSendOtp={formSubmit}
                    />
                </CustomModal>
            )}
        </CustomDivWithBorder>
    )
}
export default BasicInformationForm
