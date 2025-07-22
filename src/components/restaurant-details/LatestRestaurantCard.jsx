import { alpha, Stack, styled, Typography, Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import {
    CustomPaperBigCard,
    CustomStackFullWidth,
} from '@/styled-components/CustomStyles.style'
import { DistanceCalculate, getAmount } from '@/utils/customFunctions'
import CustomImageContainer from '../CustomImageContainer'
import { CustomChip } from '../food-card/FoodCard.style'
import { HomeTextTypography } from '../home/HomeStyle'
import DelivaryTruckIcon from '../../assets/images/icons/DelivaryTruckIcon'
import DistanceIcon from '../../assets/images/icons/DistanceIcon'
import RestaurantItemsIcon from '../../assets/images/icons/RestaurantItemsIcon'
import CustomNextImage from '@/components/CustomNextImage'

const ProfilePhotoWrapper = styled(Stack)(({ theme }) => ({
    justifyContent: 'center',
    alignItems: 'center',
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    borderRadius: '100%',
}))

const LatestRestaurantCard = (props) => {
    const {
        image,
        logo,
        name,
        id,
        active,
        open,
        characteristics,
        slug,
        zone_id,
        distance,
        discount,
        foods_count,
        delivery_fee,
        hoveredMarkerId,
        order_details,
    } = props
    const { t } = useTranslation()
    const theme = useTheme()
    const router = useRouter()
    const isSmall = useMediaQuery(theme.breakpoints.down('md'))
    const { global } = useSelector((state) => state.globalSettings)
    let currencySymbol
    let currencySymbolDirection
    let digitAfterDecimalPoint
    const percentOff = t('% OFF')
    const OFF = t('OFF')
    if (global) {
        currencySymbol = global.currency_symbol
        currencySymbolDirection = global.currency_symbol_direction
        digitAfterDecimalPoint = global.digit_after_decimal_point
    }
    const discountChip = () => {
        if (Number.parseInt(discount?.discount) > 0) {
            if (discount?.discount_type === 'percent') {
                return (
                    <CustomChip
                        discount
                        label={
                            !discount.end_date
                                ? `${discount?.discount} %`
                                : ` ${discount?.discount} ${percentOff}`
                        }
                        campaign={discount.end_date}
                    />
                )
            } else {
                return (
                    <CustomChip
                        discount
                        label={
                            !discount.end_date
                                ? ` ${getAmount(
                                      discount?.discount,
                                      currencySymbolDirection,
                                      currencySymbol,
                                      digitAfterDecimalPoint
                                  )}`
                                : ` ${getAmount(
                                      discount?.discount,
                                      currencySymbolDirection,
                                      currencySymbol,
                                      digitAfterDecimalPoint
                                  )} ${OFF}`
                        }
                        campaign={discount.end_date}
                    />
                )
            }
        }
    }

    const restaurantCloseHandler = () => {
        if (active) {
            if (open === 0) {
                return (
                    <Stack
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            background: (theme) =>
                                alpha(theme.palette.primary.overLay, 0.5),

                            color: 'theme.palette.whiteContainer.main',
                            height: '100%',
                            justifyContent: 'center',
                            zIndex: 1,
                            backdropFilter: 'blur(1.5px)',
                            borderRadius: '5px',
                        }}
                    >
                        <Typography
                            variant="h4"
                            align="center"
                            color={theme.palette.whiteContainer.main}
                            sx={{
                                textTransform: 'uppercase',
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            {t('Closed Now')}
                        </Typography>
                    </Stack>
                )
            }
        } else {
            return (
                <Stack
                    sx={{
                        position: 'absolute',
                        zIndex: 2,
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        background: (theme) =>
                            alpha(theme.palette.primary.overLay, 0.5),

                        color: 'theme.palette.whiteContainer.main',
                        height: '100%',
                        justifyContent: 'center',
                        borderRadius: '5px',
                    }}
                >
                    <Typography
                        variant="h4"
                        align="center"
                        color={theme.palette.whiteContainer.main}
                        sx={{ textTransform: 'uppercase', fontWeight: '700' }}
                    >
                        {t('Closed Now')}
                    </Typography>
                </Stack>
            )
        }
    }
    const handleClick = () => {
        router.push({
            pathname: `/restaurant/[id]`,
            query: {
                id: `${slug ? slug : id}`,
                restaurant_zone_id: zone_id,
            },
        })
    }
    return (
        <>
            <Stack
                maxWidth={{ xs: '290px', sm: '310px', md: '320px' }}
                height={{ xs: '195px', md: '210px' }}
                onClick={handleClick}
                id={`restaurent-${id}`}
            >
                <CustomPaperBigCard
                    nopadding="true"
                    border
                    sx={{
                        padding: '10px',
                        cursor: 'pointer',
                        width: '100%',
                        minWidth: { xs: '290px', sm: '310px', md: '320px' },
                        height: '100%',
                        border:
                            hoveredMarkerId === id
                                ? `1px solid ${theme.palette.primary.main}`
                                : `1px solid rgba(255, 138, 0, 0.10)`,
                        '&:hover': {
                            boxShadow: `0px 0px 2px rgba(145, 158, 171, 0.2), 0px 5px 20px ${theme.palette.paperBoxShadow}`,
                        },
                    }}
                >
                    <CustomStackFullWidth spacing={1}>
                        <Stack
                            sx={{
                                overflow: 'hidden',
                                position: 'relative',
                                borderRadius: '8px',
                            }}
                        >
                            {restaurantCloseHandler()}

                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100px',
                                    transition: `${theme.transitions.create(
                                        ['background-color', 'transform'],
                                        {
                                            duration:
                                                theme.transitions.duration
                                                    .standard,
                                        }
                                    )}`,
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                    },
                                }}
                            >
                                {discount && (
                                    <Stack
                                        position="absolute"
                                        bottom="10%"
                                        left="0"
                                        zIndex="1"
                                    >
                                        {discountChip()}
                                    </Stack>
                                )}
                                <CustomNextImage
                                    src={image}
                                    width="310"
                                    height="100"
                                    objectFit={image?"cover":"contain"}
                                    borderRadius="8px"
                                />
                            </Box>
                        </Stack>
                        <Stack
                            flexDirection="row"
                            gap={{ xs: '5px', md: '13px' }}
                            alignItems="center"
                            marginTop="17px"
                        >
                            <ProfilePhotoWrapper
                                width={{ xs: '50px', md: '70px' }}
                                minWidth={{ xs: '50px', md: '70px' }}
                                height={{ xs: '50px', md: '70px' }}
                                padding={{ xs: '5px', md: '10px' }}
                            >
                                <CustomNextImage
                                    src={logo}
                                    width={isSmall?'30':'50'}
                                    height={isSmall?'30':'50'}
                                    objectFit={logo?"cover":"contain"}
                                    borderRadius="100%"
                                />
                            </ProfilePhotoWrapper>
                            <CustomStackFullWidth
                                paddingX="5px"
                                spacing={0.4}
                                justifyContent="center"
                            >
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    sx={{ position: 'relative' }}
                                >
                                    <HomeTextTypography component="h3">
                                        {name.length > 30
                                            ? `${name.slice(0, 30)}... `
                                            : name}
                                    </HomeTextTypography>
                                </Stack>

                                <Typography
                                    align="left"
                                    fontSize="13px"
                                    color={theme.palette.neutral[600]}
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '1',
                                        WebkitBoxOrient: 'vertical',
                                        wordWrap: 'break-word',
                                    }}
                                    component="p"
                                >
                                    {characteristics?.length > 0 &&
                                        characteristics?.map((item, index) => (
                                            <>
                                                {item}{' '}
                                                {characteristics.length - 1 ===
                                                index
                                                    ? ''
                                                    : ','}
                                            </>
                                        ))}
                                </Typography>

                                <Stack flexDirection="row" gap="7px">
                                    {!(
                                        delivery_fee === 'out_of_range' ||
                                        delivery_fee === '0' ||
                                        order_details
                                    ) && (
                                        <Stack
                                            flexDirection="row"
                                            alignItems="center"
                                            gap="3px"
                                        >
                                            <DelivaryTruckIcon />
                                            <Typography
                                                fontSize="12px"
                                                fontWeight={400}
                                            >
                                                {delivery_fee ===
                                                'free_delivery'
                                                    ? t('Free')
                                                    : getAmount(
                                                          delivery_fee,
                                                          currencySymbolDirection,
                                                          currencySymbol,
                                                          0
                                                      )}
                                            </Typography>
                                        </Stack>
                                    )}
                                    <Stack
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="3px"
                                    >
                                        <DistanceIcon />
                                        <Typography
                                            fontSize="12px"
                                            fontWeight={400}
                                        >
                                            <DistanceCalculate
                                                distance={distance}
                                            />
                                        </Typography>
                                    </Stack>
                                    <Stack
                                        flexDirection="row"
                                        alignItems="center"
                                        gap="3px"
                                    >
                                        <RestaurantItemsIcon />
                                        <Typography
                                            fontSize="12px"
                                            fontWeight={400}
                                        >
                                            {foods_count?.length
                                                ? foods_count?.length > 99
                                                    ? `${foods_count?.length}+`
                                                    : `${foods_count?.length}` +
                                                      ` items`
                                                : ''}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </CustomStackFullWidth>
                        </Stack>
                    </CustomStackFullWidth>
                </CustomPaperBigCard>
            </Stack>
        </>
    )
}

export default LatestRestaurantCard
