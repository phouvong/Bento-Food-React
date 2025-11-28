import { alpha, Paper, styled, TextField, Typography, Box } from '@mui/material'
import { CustomButtonPrimary } from '@/styled-components/CustomButtons.style'
import { Stack } from '@mui/system'

export const CustomBox = styled(Box)(({ theme }) => ({
    width: '100%',
    [theme.breakpoints.down('sm')]: {
        marginTop: '10px',
    },
}))
export const CustomSearchField = styled(Paper)(({ theme, height }) => ({
    width: '100%',
    border: 'none',
    borderBottomRightRadius: '0px',
    borderTopRightRadius: '0px',
    height: height || '44px',
}))
export const StyledButton = styled(CustomButtonPrimary)(
    ({ theme, radiuschange, languageDirection }) => ({
        color: `${theme.palette.whiteContainer.main} !important`,
        width: '500px',
        padding: '8px 7px 12px 7px',

        marginLeft: languageDirection === 'rtl' && '15px',
        borderTopLeftRadius:
            (languageDirection === 'ltr' || !languageDirection) &&
            radiuschange === 'true'
                ? '0px'
                : '6px',
        borderBottomLeftRadius:
            (languageDirection === 'ltr' || !languageDirection) &&
            radiuschange === 'true'
                ? '0px'
                : '6px',
        borderTopRightRadius:
            languageDirection === 'rtl' && radiuschange === 'true'
                ? '0px'
                : '6px',
        borderBottomRightRadius:
            languageDirection === 'rtl' && radiuschange === 'true'
                ? '0px'
                : '6px',
    })
)

export const CssTextField = styled(TextField)(
    ({ theme, languageDirection, mobileview, getLocation }) => ({
        ...(getLocation
            ? {}
            : {
                width: '100%',
                '& label.Mui-focused': {
                    color: theme.palette.primary.main,
                    background: theme.palette.neutral[100],
                },
                '& .MuiInput-underline:after': {
                    borderBottomColor: theme.palette.primary.main,
                    background: theme.palette.neutral[100],
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    border:
                        mobileview === 'true'
                            ? `.5px solid ${alpha(theme.palette.primary.main, 0.3)}`
                            : 'none',
                },
                // ✅ Corrected input selector
                '& .MuiOutlinedInput-input': {

                    fontSize: '16px',
                    [theme.breakpoints.down('sm')]: {
                        fontSize: '12px',
                        padding:"11.5px 14px"
                    },
                },
                '& .MuiOutlinedInput-root': {
                    paddingTop: '0px',
                    paddingBottom: '0px',
                    borderTopRightRadius:
                        mobileview === 'true'
                            ? '4px'
                            : (languageDirection === 'ltr' || !languageDirection) && '0px',
                    borderBottomRightRadius:
                        mobileview === 'true'
                            ? '4px'
                            : (languageDirection === 'ltr' || !languageDirection) && '0px',
                    borderTopLeftRadius:
                        mobileview === 'true'
                            ? '4px'
                            : languageDirection === 'rtl' && '0px',
                    borderBottomLeftRadius:
                        mobileview === 'true'
                            ? '4px'
                            : languageDirection === 'rtl' && '0px',
                    '& fieldset': {
                        borderColor: theme.palette.primary.main,
                    },
                    '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                    },
                },
            }),
    })
);


export const CustomButton = styled(Paper)(({ theme, backgroundColor }) => ({
    height: '50px',
    borderRadius: '5px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: backgroundColor,
    [theme.breakpoints.down('md')]: {
        width: '125px',
        height: '45px',
    },
}))
export const HeroCardTypography = styled(Typography)(({ theme }) => ({
    textAlign: 'center',
    color: theme.palette.customColor.seven,
    fontWeight: 600,
    letterSpacing: '0.05em',
}))

export const CategoryCardBox = styled(Box)(({ theme, fontSize }) => ({
    position: 'relative',
    zIndex: 1,
    lineHeight: 1,
    "&:after": {
        content: '" "',
        position: 'absolute',
        width: '100%',
        height: 'calc(100% - 2px)',
        left: '0',
        top: '0',
        zIndex: '1',
        background: alpha("#000", 0.6),
        borderRadius: '10px',
    },
    fontSize: fontSize || "inherit",
}))

export const FoggyWrapper = styled(Stack)(({ theme }) => ({
    position: "relative",
    overflow: "hidden",

    "&::before, &::after": {
        content: '""',
        position: "absolute",
        top: 0,
        width: "60px",
        height: "100%",
        zIndex: 3,
        pointerEvents: "none",
    },
    "&::before": {
        left: 0,
        background: `linear-gradient(to right, ${theme.palette.background.default} 0%, transparent 100%)`,
    },
    "&::after": {
        right: 0,
        background: `linear-gradient(to left, ${theme.palette.background.default} 0%, transparent 100%)`,
    },
    "&:hover > *": {
        animationPlayState: "paused",
    },
}));

export const CustomImageGridBox = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    gap: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    // gridAutoFlow: "dense",

    "& > div": {
        overflow: "hidden",
        position: "relative",
    },

    "& > div:nth-of-type(1)": {
        gridColumn: "1 / 3",
        gridRow: "1 / 3",
    },
    "& > div:nth-of-type(2)": {
        gridColumn: "3 / 4",
        gridRow: "1 / 2",
    },
    "& > div:nth-of-type(3)": {
        gridColumn: "4 / 5",
        gridRow: "1 / 2",
    },
    "& > div:nth-of-type(4)": {
        gridColumn: "1 / 2",
        gridRow: "3 / 4",
    },
    "& > div:nth-of-type(5)": {
        gridColumn: "2 / 3",
        gridRow: "3 / 4",
    },
    "& > div:nth-of-type(6)": {
        gridColumn: "3 / 5",
        gridRow: "2 / 4",
    },

    [theme.breakpoints.down("sm")]: {
        gap: "8px",
        gridTemplateColumns: "repeat(2, 1fr)",
        gridTemplateRows: "auto",
        "& > div:nth-of-type(1)": {
            gridColumn: "1 / 3",
            gridRow: "1 / 3",
        },
        "& > div:nth-of-type(2)": {
            gridColumn: "1 / 2",
            gridRow: "3 / 4",
        },
        "& > div:nth-of-type(3)": {
            gridColumn: "2 / 3",
            gridRow: "3 / 4",
        },
        "& > div:nth-of-type(4)": {
            gridColumn: "1 / 2",
            gridRow: "4 / 5",
        },
        "& > div:nth-of-type(5)": {
            gridColumn: "2 / 3",
            gridRow: "4 / 5",
        },
        "& > div:nth-of-type(6)": {
            gridColumn: "1 / 3",
            gridRow: "5 / 7",
        },
    },

    img: {
        width: "100%",
        height: "100%",
    },
}));
