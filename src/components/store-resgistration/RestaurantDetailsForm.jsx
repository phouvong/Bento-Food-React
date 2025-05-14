import React, { useEffect } from 'react'
import {
    alpha,
    Box,
    Grid,
    InputAdornment,
    Tooltip,
    useTheme,
} from '@mui/material'
import CustomTextFieldWithFormik from '../form-fields/CustomTextFieldWithFormik'
import { useTranslation } from 'react-i18next'
import RoomIcon from '@mui/icons-material/Room'
import PaidIcon from '@mui/icons-material/Paid'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomSelectWithFormik from '../custom-select/CustomSelectWithFormik'
import CustomMultiSelectTags from '../custom-multi-select-tags/CustomMultiSelectTags'
import FastfoodIcon from '@mui/icons-material/Fastfood'
import StoreIcon from '@mui/icons-material/Store'
import { useGetCuisines } from '@/hooks/react-query/cuisines/useGetCuisines'
import SubjectIcon from '@mui/icons-material/Subject'
import MultiSelectTypedInput from '@/components/MultiSelectTypedInput/MultiSelectTypedInput'
const RestaurantDetailsForm = ({
    RestaurantJoinFormik,
    restaurantNameHandler,
    handleClearAllCuisines,
    zoneOption,
    zoneHandler,
    handleTimeTypeChangeHandler,
    selectedLanguage,
    handleDeleteCuisine,
    cuisinesHandler,submitForm
                                   ,setInZone
}) => {
    const { data: cuisines, refetch, isRefetching } = useGetCuisines()
    useEffect(() => {
        refetch()
    }, [])

    const cuisinesData = cuisines?.Cuisines?.map((item) => {
        return {
            label: item.name,
            value: item.id,
        }
    })

    const { t } = useTranslation()
    const theme = useTheme()
    const [address, setAddress] = React.useState('')
    const timeType = [
        { label: 'Minute', value: 'minute' },
        { label: 'Hour', value: 'hour' },
        { label: 'Day', value: 'day' },
    ]
    useEffect(() => {
        setAddress(
            RestaurantJoinFormik.values.restaurant_address[selectedLanguage]
        )
    }, [RestaurantJoinFormik.values.restaurant_address[selectedLanguage]])

    return (
        <CustomStackFullWidth
            alignItems="center"
            key={address || selectedLanguage}
            sx={{ mt: 0.6 }}
        >
            <Grid container spacing={{ xs: '20px', md: '44.3px' }}>
                <Grid item xs={12} sm={12} md={12}>
                    <CustomTextFieldWithFormik
                        required
                        type="text"
                        label={t('Restaurant Name')}
                        placeholder={t('Restaurant Name')}
                        borderRadius="8px"
                        value={
                            RestaurantJoinFormik.values.restaurant_name[
                                selectedLanguage
                            ]
                        }
                        touched={RestaurantJoinFormik.touched.restaurant_name}
                        errors={RestaurantJoinFormik.errors.restaurant_name}
                        onChangeHandler={restaurantNameHandler}
                        fontSize="12px"
                        startIcon={
                            <InputAdornment position="start">
                                <StoreIcon
                                    sx={{
                                        color:
                                            RestaurantJoinFormik.touched
                                                .restaurant_name &&
                                            !RestaurantJoinFormik.errors
                                                .restaurant_name
                                                ? theme.palette.primary.main
                                                : theme.palette.neutral[400],
                                        fontSize: '18px',
                                    }}
                                />
                            </InputAdornment>
                        }
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <CustomMultiSelectTags
                        label="Cuisines"
                        options={cuisinesData}
                        placeholder={t('Select Cuisines')}
                        onChange={cuisinesHandler}
                        value={cuisinesData?.filter((option) =>
                            RestaurantJoinFormik.values.cuisine_ids.includes(
                                option.value
                            )
                        )}
                        handleClear={handleClearAllCuisines}
                        handleDelete={handleDeleteCuisine}
                        startIcon={
                            <InputAdornment position="start">
                                <FastfoodIcon
                                    sx={{
                                        color:
                                            RestaurantJoinFormik.touched
                                                .min_delivery_time &&
                                            !RestaurantJoinFormik.errors
                                                .min_delivery_time
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
                <Grid item xs={12} sm={12} md={12}>
                    <CustomSelectWithFormik
                        selectFieldData={zoneOption}
                        inputLabel={
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    position: 'relative',
                                }}
                            >
                                {t('Select Zones')}
                                <Tooltip
                                    title="Select a Zones"
                                    placement="top"
                                    sx={{
                                        zIndex: '500px',
                                    }}
                                >
                                    <ErrorOutlineIcon
                                        sx={{
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Tooltip>
                            </Box>
                        }
                        fieldSetGap="9.2px"
                        passSelectedValue={zoneHandler}
                        touched={RestaurantJoinFormik.touched.zoneId}
                        errors={RestaurantJoinFormik.errors.zoneId}
                        fieldProps={RestaurantJoinFormik.getFieldProps(
                            'zoneId'
                        )}
                        placeholder="Select Zones"
                        height="45px"
                        borderRadius="8px"
                        startIcon={
                            <RoomIcon
                                sx={{
                                    color:
                                        RestaurantJoinFormik.touched.zoneId &&
                                        !RestaurantJoinFormik.errors.zoneId
                                            ? theme.palette.primary.main
                                            : alpha(
                                                  theme.palette.neutral[400],
                                                  0.7
                                              ),
                                    fontSize: '18px',
                                }}
                            />
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={12} md={12}>
                    <MultiSelectTypedInput
                        placeholder={t('Tag')}
                        label={
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: (theme) =>
                                        theme.palette.neutral[1000],
                                }}
                            >
                                {t('Tag')}
                                <Tooltip
                                    title={t(
                                        'Write your content and press enter.'
                                    )}
                                    placement="top"
                                >
                                    <ErrorOutlineIcon
                                        sx={{
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </Tooltip>
                            </Box>
                        }
                        borderRadius="8px"
                        selectedValues={RestaurantJoinFormik.values.tags}
                        fieldName="tags"
                        startIcon={
                            <SubjectIcon
                                sx={{
                                    color:
                                        RestaurantJoinFormik.touched.vat &&
                                        !RestaurantJoinFormik.errors.vat
                                            ? theme.palette.primary.main
                                            : alpha(
                                                  theme.palette.neutral[400],
                                                  0.7
                                              ),
                                    fontSize: '18px',
                                }}
                            />
                        }
                        formik={RestaurantJoinFormik}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                    <CustomTextFieldWithFormik
                        required
                        type="number"
                        borderRadius="8px"
                        fieldsetGap="9px"
                        label={
                            <span>
                                {t('VAT/TAX')}
                                <Tooltip title="Enter vat/tax" placement="top">
                                    <ErrorOutlineIcon
                                        sx={{
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            ml: 0.3,
                                        }}
                                    />
                                </Tooltip>
                            </span>
                        }
                        // label={t('VAT/TAX')}
                        placeholder={t('VAT/TAX')}
                        touched={RestaurantJoinFormik.touched.vat}
                        errors={RestaurantJoinFormik.errors.vat}
                        fieldProps={RestaurantJoinFormik.getFieldProps('vat')}
                        onChangeHandler={restaurantNameHandler}
                        value={RestaurantJoinFormik.values.vat}
                        fontSize="12px"
                        startIcon={
                            <InputAdornment position="start">
                                <PaidIcon
                                    sx={{
                                        color:
                                            RestaurantJoinFormik.touched.vat &&
                                            !RestaurantJoinFormik.errors.vat
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
                <Grid item container xs={12} sm={12} md={12} spacing={2}>
                    <Grid item md={4} xs={12}  marginBottom={RestaurantJoinFormik.errors.min_delivery_time?"10px":"0px"}>
                        <CustomTextFieldWithFormik
                            placeholder={t('Min Delivery Time')}
                            required
                            type="number"
                            label={t('Minimum Delivery Time')}
                            borderRadius="8px"
                            touched={
                                RestaurantJoinFormik.touched.min_delivery_time
                            }
                            errors={
                                RestaurantJoinFormik.errors.min_delivery_time
                            }
                            fieldProps={RestaurantJoinFormik.getFieldProps(
                                'min_delivery_time'
                            )}
                            onChangeHandler={restaurantNameHandler}
                            value={
                                RestaurantJoinFormik.values.min_delivery_time
                            }
                            fontSize="14px"
                            startIcon={
                                <InputAdornment position="start">
                                    <LocalShippingIcon
                                        sx={{
                                            color:
                                                RestaurantJoinFormik.touched
                                                    .min_delivery_time &&
                                                !RestaurantJoinFormik.errors
                                                    .min_delivery_time
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
                    <Grid item md={4} xs={12} marginBottom={RestaurantJoinFormik.errors.max_delivery_time?"10px":"0px"}>
                        <CustomTextFieldWithFormik
                            placeholder={t('Max Delivery Time')}
                            required="true"
                            type="number"
                            label={t('Maximum Delivery Time')}
                            borderRadius="8px"
                            touched={
                                RestaurantJoinFormik.touched.max_delivery_time
                            }
                            errors={
                                RestaurantJoinFormik.errors.max_delivery_time
                            }
                            fieldProps={RestaurantJoinFormik.getFieldProps(
                                'max_delivery_time'
                            )}
                            onChangeHandler={restaurantNameHandler}
                            value={
                                RestaurantJoinFormik.values.max_delivery_time
                            }
                            fontSize="12px"
                            startIcon={
                                <InputAdornment position="start">
                                    <LocalShippingIcon
                                        sx={{
                                            color:
                                                RestaurantJoinFormik.touched
                                                    .max_delivery_time &&
                                                !RestaurantJoinFormik.errors
                                                    .max_delivery_time
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
                    <Grid item xs={12} sm={12} md={4}>
                        <CustomSelectWithFormik
                            selectFieldData={timeType}
                            inputLabel={t('Duration Type')}
                            value={
                                RestaurantJoinFormik.values?.delivery_time_type
                            }
                            borderRadius="8px"
                            passSelectedValue={handleTimeTypeChangeHandler}
                            touched={
                                RestaurantJoinFormik.touched.delivery_time_type
                            }
                            errors={
                                RestaurantJoinFormik.errors.delivery_time_type
                            }
                            fieldProps={RestaurantJoinFormik.getFieldProps(
                                'delivery_time_type'
                            )}
                            height="45px"
                        />
                    </Grid>
                </Grid>
            </Grid>
        </CustomStackFullWidth>
    )
}
export default RestaurantDetailsForm
