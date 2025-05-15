import {
    Box,
    Paper,
    Stack,
    styled,
    TextField,
    Typography,
    OutlinedInput,
    Fab,
    Tabs,
    ListItem,
    Accordion,
    Button,
} from '@mui/material'
import Link from '@mui/material/Link'
import { transform } from 'lodash'

export const CustomTextField = styled(TextField)(({ theme }) => ({
    [theme.breakpoints.up('sm')]: {},
}))

export const FlexContainerCenter = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '1400px',
    width: '100%',
    marginRight: 'auto',
    marginLeft: 'auto',
})
export const CustomButton = styled(Button)(({ theme }) => ({
    [theme.breakpoints.up('sm')]: {},
}))

export const CustomPaperBigCard = styled(Paper)(
    ({
        theme,
        nopadding,
        minheight,
        height,
        backgroundColor,
        padding,
        width,
        noboxshadow,
    }) => ({
        margin: '1px',
        backgroundColor: backgroundColor || theme.palette.background.paper,
        padding: nopadding === 'true' ? 'none' : padding ? padding : '1.875rem',
        width: width ? width : '100%',
        height: height ? height : '100%',
        minHeight: minheight && minheight,
        borderRadius: '10px',
        boxShadow:
            noboxshadow === 'true'
                ? 'none'
                : `0px 0px 2px rgba(145, 158, 171, 0.2), 0px 5px 20px ${theme.palette.paperBoxShadow}`,
    })
)

export const CustomImageContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    height: '100%',

    '& img': {
        width: '100%',
        height: '100%',
        borderRadius: '5px',
        objectFit: 'contained',
    },
}))

export const ImageContainer = styled(Box)(({ theme }) => ({
    borderRadius: '0.125rem',
    position: 'relative',
    '& img': {
        width: '100%',
        height: '300px',
        objectFit: 'contain',
    },
}))
export const CustomColouredTypography = styled(Typography)(
    ({ theme, color, fontsize, smallFont }) => ({
        color: color ? color : theme.palette.primary.main,
        fontSize: fontsize,
        [theme.breakpoints.down('md')]: {
            // styles
            fontSize: smallFont ? smallFont : fontsize,
        },
    })
)

export const CustomStack = styled(Stack)({
    alignItems: 'start',
    width: '100%',
    paddingLeft: '1rem',
})
export const CustomTabs = styled(Tabs)(({ theme }) => ({
    padding: '5px',
    borderRadius: '15px',
}))
export const CloseIconWrapper = styled('div')(
    ({ theme, right, languageDirection }) => ({
        top: 0,
        right: languageDirection !== 'rtl' ? (right ? right : 9) : null,
        left: languageDirection === 'rtl' ? (right ? right : 9) : null,
        height: '100%',
        position: 'absolute',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    })
)

export const CustomTypographyBold = styled(Typography)(
    ({ theme, marginTop, textAlign, fontSize, fontWeight }) => ({
        fontWeight: fontWeight ?? 'bold',
        color: theme.palette.neutral[1000],
        textAlign: textAlign ?? 'inherit',
        fontSize: fontSize ?? '20px',
    })
)
export const CustomTypographyAlign = styled(Typography)(({ theme, align }) => ({
    textAlign: align,
}))

export const CustomIconButton = styled(Box)(({ theme, marginTop }) => ({
    color: theme.palette.neutral[700],
    cursor: 'pointer',
}))

export const CustomBoxFullWidth = styled(Box)(({ theme }) => ({
    width: '100%',
}))
export const CustomStackFullWidth = styled(Stack)(
    ({ theme, marginBottom, marginTop }) => ({
        width: '100%',
        marginBottom: marginBottom,
        marginTop: marginTop,
    })
)

export const Logo = styled('div')(({ theme, height, width }) => ({
    width: width,
    height: '24px',
    justifyContent: 'center',
    maxWidth: '100px',
    position: 'relative',
    cursor: 'pointer',
    '& img': {
        height: '100%',
        objectFit: 'contain',
    },
}))
export const CustomLink = styled(Link)(({ theme, color }) => ({
    color: color ? color : 'primary.main',
    cursor: 'pointer',
    fontWeight: '600',
    '&:hover': {
        color: theme.palette.primary.dark,
    },
}))
export const CustomTextFieldContainer = styled(Box)(
    ({ theme, background, noheight }) => ({
        width: '100%',
        color: theme.palette.neutral[1000],
    })
)
export const CustomStackForLoaction = styled(Stack)(({ theme }) => ({
    justifyContent: 'flex-start',
    cursor: 'pointer',
    alignItems: 'center',
}))
export const CustomOverLay = styled(Stack)(
    ({ theme, hover, border_radius }) => ({
        background: 'rgba(75, 86, 107, 0.5)',
        borderRadius: border_radius ? border_radius : '5px 5px 0px 0px',
        width: '100%',
        opacity: hover ? 1 : 0,
        inset: 0,
        position: 'absolute',
        top: 0,
        zIndex: 1,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
            opacity: 1,
            transform: 'scale(1.1)',
        },
    })
)
export const CustomOverlayBox = styled(Box)(({ theme, borderradius }) => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    top: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
    color: 'white',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9,
    borderRadius: borderradius || '8px',
}))
export const CustomViewAll = styled(Stack)(({ theme, marginRight }) => ({
    justifyContent: 'end',
    color: theme.palette.primary.main,
    paddingTop: '5px',
    paddingBottom: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    marginInlineEnd: marginRight ? marginRight : '1rem',
    [theme.breakpoints.down('md')]: {
        marginInlineEnd: marginRight ? '.3rem' : '0',
    },
}))
export const CustomFab = styled(Fab)(({ theme }) => ({
    width: '33px',
    height: '33px',
    [theme.breakpoints.down('sm')]: {
        width: '33px',
        height: '35px',
    },
}))
export const CustomImageContainerStyled = styled(Box)(
    ({
        theme,
        smWidth,
        maxWidth,
        marginBottom,
        width,
        smHeight,
        height,
        objectFit,
        minwidth,
        borderRadu,
        smMb,
        smMaxWidth,
        mdHeight,
        cursor,
        aspectRatio,
        boxShadow,
    }) => ({
        display: 'inline-flex',
        background: 'transparent',
        width: width ? width : '100%',
        height: height ? height : '100%',
        minWidth: minwidth,
        maxWidth: maxWidth,
        marginBottom: marginBottom,
        position: 'relative',
        boxShadow: boxShadow,
        borderRadius: borderRadu,
        cursor: cursor ? cursor : 'inherit',
        [theme.breakpoints.down('md')]: {
            height: mdHeight ? mdHeight : '',
            width: smWidth ? smWidth : '',
        },

        [theme.breakpoints.down('sm')]: {
            marginBottom: smMb ? smMb : '',
            height: smHeight ? smHeight : '',
            maxWidth: smMaxWidth ? smMaxWidth : '',
            width: smWidth ? smWidth : '',
        },
        '& img': {
            width: '100% ',
            height: '100%',
            objectFit: objectFit ? objectFit : 'contain',
            borderRadius: borderRadu,
            aspectRatio: aspectRatio ? aspectRatio : 'auto',
        },
    })
)
export const CustomListItem = styled(ListItem)(
    ({ theme, display, cursor }) => ({
        display: display,
        cursor: cursor && 'pointer',
    })
)
export const SliderCustom = styled(Stack)(
    ({ theme, languageDirection, gap, paddingBottom, isCenter, ads }) => ({
        alignItems: 'center',
        paddingY: '1rem',
        '& .slick-slider': {
            '& .slick-list': {
                '& .slick-track': {
                    float: isCenter
                        ? 'center'
                        : languageDirection === 'rtl'
                        ? ads
                            ? 'left'
                            : 'right'
                        : 'left',
                    gap: gap ? gap : '5px',
                    paddingBottom: paddingBottom || 0,
                    
                   
                },
            },
            '& .slick-dots': {
                bottom: '-22px !important',
                textAlign: 'center !important',
                left: '0 !important',
                '& li': {
                    '& .slick-active': {
                        '& button': {
                            '&::before': {
                                content: '" "',
                                fontSize: '12px !important',
                            },
                        },
                    },
                },
            },
        },
    })
)

export const CustomOutlinedInput = styled(OutlinedInput)(({ theme, type }) => ({
    borderRadius: '7px',
    height: '48px',
    width: '100%',
    maxWidth: '457px',
    outline: 'none !important',
    border: 'none !important',
    boxShadow: 'none !important',
    background: theme.palette.background.paper,
    paddingInline: '35px',
    fontSize: '20px',
    input: {
        textAlign: 'center',
        fontWeight: '400',
    },
    'input::-webkit-inner-spin-button': {
        display: 'none',
    },
    'input::-webkit-iuter-spin-button': {
        display: 'none',
    },
}))

export const CustomAccordion = styled(Accordion)(({ theme, background }) => ({
    boxShadow: 'none !important',
    backgroundColor: background ?? theme.palette.neutral[100],
    '.MuiAccordionSummary-root': {
        padding: '0px 0px',
        minHeight: '0px',
    },
    '.MuiAccordionSummary-content': {
        width: '100%',
        display: 'inline',
        marginTop: '12px',
        marginBottom: '0px',
    },
    '.MuiAccordionDetails-root': {
        padding: '2px 5px 10px',
    },
}))
export const WrapperForSideDrawerFilter = styled(Box)(
    ({ theme, smminwith }) => ({
        paddingTop: '2rem',
        paddingBottom: '2rem',
        paddingLeft: '1rem',
        paddingRight: '1rem',
        minWidth: '250px',
        maxWidth: '350px',
        width: '350px',
        [theme.breakpoints.down('sm')]: {
            minWidth: smminwith ? smminwith : '180px',
            width: '300px',
        },
    })
)
