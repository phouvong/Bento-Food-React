import { Box, Stack } from '@mui/system'
import { BannerFormPaper } from '@/components/restaurant-resgistration-landing/LandingStyles.style'
import {
    alpha, Autocomplete, FormControl, FormHelperText, IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography, useMediaQuery,
} from '@mui/material'
import { t } from 'i18next'
import StoreIcon from '@mui/icons-material/Store'
import MyLocationIcon from '@mui/icons-material/MyLocation';
import React, { useEffect, useState } from 'react'
import { useTheme } from '@mui/styles'
import RoomIcon from '@mui/icons-material/Room'
import ImageUploaderWithPreview from '@/components/single-file-uploader-with-preview/ImageUploaderWithPreview'
import { PrimaryButton } from '@/components/products-page/FoodOrRestaurant'
import Router from 'next/router'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setBusinessLogo } from '@/redux/slices/global'
import useGetZoneList from '@/hooks/react-query/zone-list/zone-list'
import { setZoneOptions } from '@/redux/slices/storeRegistrationData'
import HeroLocationForm from '@/components/landingpage/HeroLocationForm'

const BannerForm = ({business_name}) => {
    const theme = useTheme();
    const dispatch = useDispatch()
    const [value, setValue] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const mobileview = useMediaQuery(theme.breakpoints.down('sm'));


    const {
        data: zoneList,
        refetch: zoneListRefetch,
    } = useGetZoneList();

    let zoneId
    if (typeof window !== 'undefined') {
        zoneId = localStorage.getItem('zoneid')

    }

    useEffect(() => {
        if (zoneId &&  zoneList?.length) {
            const zoneListId = zoneList?.map((item) => item?.id);
            const commonZoneId = zoneListId?.find((id) => zoneId.includes(id));

            if (commonZoneId) {
                setValue((prev) => ({ ...prev, zoneId: commonZoneId }));
            }
        }


    }, [zoneId, zoneList]);


    useEffect(() => {
        zoneListRefetch()
    }, []);

    let zoneOption = []
    zoneList?.forEach((zone) => {
        let obj = {
            label: zone.name,
            value: zone.id,
        }
        zoneOption.push(obj)
    });

    useEffect(() => {
        if (zoneOption.length > 0) {
            dispatch(setZoneOptions(zoneOption))
        }
    }, [zoneOption]);

    const singleFileUploadHandlerForImage = (e) => {
        const file = e.currentTarget.files[0];
        if (!file) return;

        setValue({ ...value, image: file });
        dispatch(setBusinessLogo(file));
    };

    const handleSubmit = () => {
        setSubmitted(true)
        if (!value?.restaurant_name || value?.restaurant_name.trim() === '') {
            return;
        }

        if (!value?.zoneId) {
            return;
        }

        if (!value?.restaurant_address) {
            //toast.error(t('Restaurant Address is required.'));
            return;
        }

        if (!value?.image) {
            //toast.error(t('Business Logo is required.'));
            return;
        }

        Router.push(
            {
                pathname: '/restaurant-registration',
                query: { active: "active", data: JSON.stringify(value) },
            },
            undefined,
            { shallow: true }
        );
    };

    const getLocation = (location) => {
        setValue({ ...value, restaurant_address: location });
    }
    return (
        <BannerFormPaper>
            <Typography variant="h3" sx={{fontSize: {xs: 24, sm: 30}}}>{`${t("Boost your revenue with")} ${business_name}`}!</Typography>
            <Typography variant="body2" color={theme.palette.neutral[500]} mt={1} mb={4}>{`${t("Sign up now and start earning more with")} ${business_name} ${t("food delivery service.")}`}</Typography>

                <Stack gap={3}>
                    <Stack spacing={1}>
                        <TextField
                            placeholder={t('Restaurant Name')}
                            label={t('Restaurant Name')}
                            name="restaurant_name"
                            required
                            fullWidth
                            value={value?.restaurant_name}
                            onChange={(e) => setValue({ ...value, restaurant_name: e.target.value })}
                            type="text"
                            error={
                                submitted &&
                                (!value?.restaurant_name || value?.restaurant_name.trim() === '')
                            }
                            helperText={
                                submitted &&
                                (!value?.restaurant_name || value?.restaurant_name.trim() === '')
                                    ? t('Restaurant name is required')
                                    : ''
                            }
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <StoreIcon sx={{ fontSize: '18px' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>


                    <FormControl
                        fullWidth
                    >
                        <InputLabel
                            required
                            id="demo-simple-select-label"
                            sx={{
                                color: theme.palette.neutral[1000],
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px', // Reduce gap for icon and label
                                marginBottom: '2px', // Optional: Fine-tune spacing
                            }}
                        >
                            {t('Select Zones')}
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            placeholder={t('Select Zones')}
                            value={value?.zoneId || ""}
                            label="Select Zones"
                            variant="outlined"
                            onChange={(e) => setValue({ ...value, zoneId: e.target.value })}
                            sx={{
                                height: 55,
                                borderRadius: '8px',
                            }}
                            input={
                                <OutlinedInput
                                    label="Select Zones"
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <RoomIcon
                                                sx={{
                                                    fontSize: '18px',
                                                }}
                                            />
                                        </InputAdornment>
                                    }
                                />
                            }
                        >
                            {zoneOption?.length > 0 &&
                                zoneOption.map((item, index) => (
                                    <MenuItem
                                        key={index}
                                        value={item.value}
                                        sx={{
                                            maxWidth: '100%',
                                            fontSize: '13px',
                                            '&:hover': {
                                                backgroundColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.6
                                                ),
                                            },
                                        }}
                                    >
                                        {t(item.label)}
                                    </MenuItem>
                                ))}
                        </Select>
                        {submitted && (!value.zoneId || value.zoneId === "") && (
                            <FormHelperText sx={{color:theme=>theme.palette.error.light}}>{t('Zone selection is required')}</FormHelperText>
                        )}
                    </FormControl>
                    <Box>
                        <HeroLocationForm getLocation={getLocation} />
                        {submitted && (!value?.restaurant_address) && (
                            <FormHelperText sx={{color:theme=>theme.palette.error.light}}>{t('Zone selection is required')}</FormHelperText>
                        )}
                    </Box>


                    <Box sx={{backgroundColor: theme.palette.neutral[200], borderRadius: '8px', padding: '1.5rem 16px'}}>
                       <Stack direction="row" width="100%" justifyContent="center">
                           <Typography variant="h4" textAlign="center" mb={2.5} >{t('Business Logo')}</Typography>
                           <Typography sx={{color:theme=>theme.palette.error.light}} variant="h4" textAlign="center" mb={2.5} >*</Typography>
                       </Stack>

                        <Box>
                            <ImageUploaderWithPreview
                                required
                                type="file"
                                height="7rem"
                                width="7rem"
                                labelText={t('Click to upload')}
                                hintText="Image format - jpg, png, jpeg, gif Image Size - maximum size 2 MB Image Ratio - 1:1"
                                file={value?.image || ''}
                                onChange={singleFileUploadHandlerForImage}
                            />

                        </Box>

                    </Box>
                    {submitted && (!value?.image) && (
                        <FormHelperText sx={{color:theme=>theme.palette.error.light}}>{t('Logo is required')}</FormHelperText>
                    )}
                    <PrimaryButton
                        variant="contained"
                        onClick={handleSubmit}
                    >
                        {t('Let’s Start')}
                    </PrimaryButton>
                </Stack>
        </BannerFormPaper>
    )
}


export default BannerForm;