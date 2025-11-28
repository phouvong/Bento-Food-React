import {
    alpha,
    keyframes,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material'
import CustomContainer from '../container'
import 'simplebar/dist/simplebar.min.css'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { useTheme } from '@emotion/react'
import CustomNextImage from '@/components/CustomNextImage'
import { Box } from '@mui/system'
import {
    CategoryCardBox,
    CustomImageGridBox,
    FoggyWrapper,
} from '@/components/landingpage/Landingpage.style'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { CategoryApi } from '@/hooks/react-query/config/categoryApi'
import { onErrorResponse } from '@/components/ErrorResponse'
import { useEffect } from 'react'
import categories from '@/pages/categories'

const FoodCategories = ({ category_section }) => {
    const searchKey = ''

    const { data, refetch: refetchCategories } = useQuery(
        ['category'],
        () => CategoryApi.categories(searchKey),
        {
            enabled: false,
            staleTime: 1000 * 60 * 8,
            onError: onErrorResponse,
            cacheTime: 8 * 60 * 1000,
        }
    )
    const theme = useTheme()
    const { t } = useTranslation()
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
    useEffect(() => {
        refetchCategories()
    }, [])
    
    // 🔹 Scroll animations
    const scrollLeft = keyframes`
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
    `

    const scrollRight = keyframes`
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    `


    const ScrollContainerUi = ({ animationName, categories }) => (
        <Stack
            direction="row"
            gap="20px"
            sx={{
                animation:categories?.length > 5 ? `${
                    animationName || scrollLeft
                } 100s linear infinite`:`none`,
                width: 'max-content',
            }}
        >
            {categories &&
                categories?.length > 0 &&
                [...categories, ...categories]?.map((item, index) => (
                    <CategoryCardBox key={index} minWidth={224}>
                        <CustomNextImage
                            src={item?.image_full_url}
                            width={224}
                            height={72}
                            alt={`Category-${index}`}
                            objectFit="cover"
                            borderRadius="10px"
                        />
                        <Stack
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                left: '0',
                                textAlign: 'center',
                                width: '100%',
                                zIndex: 2,
                            }}
                        >
                            <Typography
                                fontSize="20px"
                                fontWeight={500}
                                color={theme.palette.whiteText.main}
                                component="h6"
                            >
                                {item.name}
                            </Typography>
                            <Typography
                                fontSize="16px"
                                color={alpha(theme.palette.whiteText.main, 0.7)}
                                component="p"
                            >
                                {Math.max(item.products_count - 1, 0)}
                                {item.products_count !== 0 && '+'} {t('Items')}
                            </Typography>
                        </Stack>
                    </CategoryCardBox>
                ))}
        </Stack>
    )


    return (
        <CustomContainer>
            <Stack mt={8} alignItems="center" mb={4}>
                <Typography
                    fontSize={{ xs: '1.5rem', md: '30px' }}
                    fontWeight={{ xs: '600', md: '700' }}
                    color={theme.palette.neutral[1000]}
                    marginBottom={{ xs: '8px', md: '12px' }}
                    textAlign="center"
                    component="h2"
                >
                    {category_section?.category_section_title}
                </Typography>
                <Typography
                    fontSize={{ xs: '14px', md: '16px' }}
                    fontWeight={{ xs: '400', md: '400' }}
                    color={theme.palette.neutral[400]}
                    paddingTop={isSmall ? '10px' : '0rem'}
                    textAlign="center"
                    component="p"
                >
                    {category_section?.category_section_sub_title}
                </Typography>
            </Stack>
            <FoggyWrapper gap="18px">
                <ScrollContainerUi categories={data?.data?.length > 10? data?.data?.slice(0,6):data?.data} />
                {data?.data?.length > 10 && (
                    <ScrollContainerUi
                        categories={data?.data?.length > 10? data?.data?.slice(5,15):data?.data}
                        animationName={scrollRight}
                    />
                )}
            </FoggyWrapper>
        </CustomContainer>
    )
}

export default FoodCategories
