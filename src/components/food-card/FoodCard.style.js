import { styled } from '@mui/material/styles'
import { alpha, Chip, Stack } from '@mui/material'
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Typography,
} from '@mui/material'
import StarIcon from '@mui/icons-material/Star'

export const CustomCardContent = styled(CardContent)(({ theme }) => ({
    borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px',
    textAlign: 'center',
    padding: '10px',
}))

export const RestaurantDetailsNavButton = styled(Button)(
    ({ theme, background }) => ({
        color: theme.palette.neutral[1000],
        padding: '6px 16px ',
        marginRight: '5px',
        '&:hover': {
            backgroundColor: background && theme.palette.primary.light,
        },
        [theme.breakpoints.down('sm')]: {
            padding: '6px 6px',
            fontSize: '13px',
        },
    })
)
export const FoodTitleTypography = styled(Typography)(
    ({ theme, textAlign, fontWeight }) => ({
        fontSize: '16px',
        fontWeight: fontWeight ? fontWeight : '400',
        padding: 0,
        margin: 0,
        textAlign: textAlign ? textAlign : 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: '1',
        WebkitBoxOrient: 'vertical',
        [theme.breakpoints.down('sm')]: {
            fontSize: '14px',
            marginBottom: '5px',
        },
    })
)

export const CustomFoodCard = styled(Card)(({ theme }) => ({
    borderRadius: '10px',
    position: 'relative',
    margin: '0 auto',
    marginBottom: '10px',
    overflow: 'hidden',
    maxWidth: '230px',
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
        maxWidth: '150px',
    },
}))
export const CustomFoodCardNew = styled(Card)(
    ({ theme, width, maxwidth, height, smheight, background, horizontal }) => ({
        backgroundColor: background,
        position: 'relative',
        padding: '8px',
        overflow: 'hidden',
        width: horizontal ? width : '100%',
        maxWidth: maxwidth,
        cursor: 'pointer',
        borderRadius: horizontal ? '8px' : '10px',
        boxShadow: horizontal
            ? `8px 10px 10px rgba(154 154 154 / 10%)`
            : ` 8px 10px 10px rgba(0, 0, 0, 0.10)`,
        height: height ? height : '100%',
        [theme.breakpoints.down('sm')]: {
            height: smheight ? smheight : '100%',
            padding: '5px',
        },
    })
)

export const CustomMoreButtonContainer = styled(Card)(({ theme }) => ({
    maxWidth: '237px',
    borderRadius: '10px',
    position: 'relative',
    height: '306px',
    textAlign: 'center',
    backgroundColor: alpha(theme.palette.primary.main, 0.4),
    cursor: 'pointer',
    [theme.breakpoints.down('sm')]: {
        maxWidth: '150px',
        height: ' 226px',
    },
}))

export const CustomMoreButton = styled(Card)(({ theme }) => ({
    position: 'absolute',
    color: theme.palette.primary.main,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'transparent',
    boxShadow: 'none',
}))

export const RatingWrapTypography = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 600,
    lineHeight: 'normal',
    [theme.breakpoints.down('sm')]: {
        fontSize: '12px',
    },
}))
export const RatingStarIcon = styled(StarIcon)((color) => ({
    fontSize: '16px',
}))

export const PricingCardActions = styled(CardActions)(({ theme }) => ({
    padding: '8px',
    alignItems: 'flex-end',
    paddingTop: '10px',
    paddingBottom: 0,
    justifyContent: 'center',
    '& .MuiCardActions-root': {
        padding: '0px',
        paddingTop: '12px',
    },
    [theme.breakpoints.down('sm')]: {
        padding: '0px',

        alignItems: 'center',
    },
}))

export const RestaurantDiscountStack = styled(Stack)(
    ({ theme, languageDirection }) => ({
        width: 'auto',
        position: 'absolute',
        bottom: 0,
        left: 'unset',
        right: 0,

        background: theme.palette.newsletterBG,
        color: theme.palette.whiteContainer.main,
        zIndex: 1,

        padding:
            languageDirection === 'rtl'
                ? '5px 5px 5px 14px'
                : '5px 6px 5px 24px',
        borderRadius:
            languageDirection === 'rtl'
                ? '37px 0px 0px 0px'
                : '38px  0px 0px  0px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '10px',
        },
    })
)

export const TypographyText = styled(Typography)(({ theme }) => ({
    color: `${theme.palette.mode === 'dark' && '#fff'}`,
}))
export const StyleThemBox = styled(Box)(({ theme }) => ({
    color: `${theme.palette.mode === 'dark' && '#9b9b9b'}`,
}))

export const CustomFavICon = styled(Box)(({ theme, languageDirection }) => ({
    position: 'absolute',
    top: '20px',
    right: languageDirection === 'rtl' ? null : '20px',
    left: languageDirection === 'rtl' ? '20px' : null,
    width: '34px',
    height: '34px',
    background: theme.palette.neutral[100],
    display: 'flex',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',

    color: theme.palette.primary.main,
    [theme.breakpoints.down('sm')]: {
        top: '10px',
        right: '10px',
    },
}))
export const CustomChip = styled(Chip)(
    ({ theme, background, discount, campaign }) => ({
        height: '22px',
        alignItems: 'center',
        backgroundColor: 'unset !important',
        '& .MuiChip-label': {
            backgroundColor: background
                ? background
                : theme.palette.customColor.two,
            color: theme.palette.whiteContainer.main,
            borderRadius: discount ? '0 4px 4px 0' : '6px',
            fontSize: '14px',
            fontWeight: 400,
            paddingInline: '5px',
            marginBottom: 'auto',
            marginTop: 'auto',
        },
    })
)
