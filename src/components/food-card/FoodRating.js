import StarIcon from '@mui/icons-material/Star'
import { Typography, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { getNumberWithConvertedDecimalPoint } from '@/utils/customFunctions'
import { CustomChip } from './FoodCard.style'

const FoodRating = ({ product_avg_rating }) => {
    const theme = useTheme()
    const starColor = theme.palette.whiteContainer.main

    return (
        <CustomChip
            background={theme.palette.customColor.eleven}
            label={
                <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={0.5}
                    alignItems="center"
                >
                    <Typography
                        fontSize="12px"
                        fontWeight="600"
                        color={theme.palette.whiteContainer.main}
                        lineHeight={1.6}
                    >
                        {getNumberWithConvertedDecimalPoint(
                            product_avg_rating,
                            1
                        )}
                    </Typography>
                    <StarIcon
                        style={{
                            width: '12px',
                            height: '12px',
                            color: starColor,
                        }}
                    />
                </Stack>
            }
        ></CustomChip>
    )
}

export default FoodRating
