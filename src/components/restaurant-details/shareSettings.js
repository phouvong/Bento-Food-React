import { Box } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

// Compact circular arrow, vertically centered on the icon row and kept
// inside the modal so it never clips at the card edge.
const arrowSx = (theme) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1,
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.12)',
    transition: 'all 120ms ease',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        '& .MuiSvgIcon-root': { color: '#fff' },
    },
    '& .MuiSvgIcon-root': {
        fontSize: 16,
        color: theme.palette.neutral?.[1000],
    },
})

const PrevArrow = ({ onClick, className }) => {
    return (
        <Box
            onClick={onClick}
            sx={(theme) => ({
                ...arrowSx(theme),
                left: 0,
                display: className?.includes('slick-disabled')
                    ? 'none'
                    : 'flex',
            })}
        >
            <ArrowBackIosNewIcon />
        </Box>
    )
}
const NextArrow = ({ onClick, className }) => {
    return (
        <Box
            onClick={onClick}
            sx={(theme) => ({
                ...arrowSx(theme),
                right: 0,
                display: className?.includes('slick-disabled')
                    ? 'none'
                    : 'flex',
            })}
        >
            <ArrowForwardIosIcon />
        </Box>
    )
}

export const shareSettings = {
    dots: false,
    infinite: false,
    slidesToShow: 9,
    slidesToScroll: 1,
    nextArrow: <NextArrow displayNoneOnMobile />,
    prevArrow: <PrevArrow displayNoneOnMobile />,

    responsive: [
        {
            breakpoint: 1450,
            settings: {
                slidesToShow: 8,
                slidesToScroll: 3,
                infinite: false,
            },
        },
        {
            breakpoint: 1024,
            settings: {
                slidesToShow: 7,
                slidesToScroll: 2,
                infinite: false,
            },
        },
        {
            breakpoint: 700,
            settings: {
                slidesToShow: 7,
                slidesToScroll: 2,
                initialSlide: 2,
            },
        },
        {
            breakpoint: 479,
            settings: {
                slidesToShow: 6,
                slidesToScroll: 1,
            },
        },
        {
            breakpoint: 420,
            settings: {
                slidesToShow: 5,
                slidesToScroll: 1,
            },
        },
    ],
}
