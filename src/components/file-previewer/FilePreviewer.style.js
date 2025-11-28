import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { ImageContainer } from '@/styled-components/CustomStyles.style'
import IconButton from '@mui/material/IconButton'

export const FilePreviewerWrapper = styled(ImageContainer)(
    ({ theme, width, objectFit, height, borderRadius, fullWidth }) => ({
        cursor: 'pointer',
        height: height ? height : '8.75rem',
        maxWidth: width,
        width: '100%',
        marginRight: 'auto',
        marginLeft: 'auto',
        overflow: 'hidden',
        '& img': {
            height: '100%',
            width: '100%',
            objectFit: objectFit ? 'contained' : 'cover',
        },
    })
)

export const IconButtonImagePreviewer = styled(IconButton)(({ theme }) => ({
    backgroundColor: theme.palette.error.light,
    color: 'white',
    position: 'absolute',
    borderRadius: '50%',
    top: -8,
    right: -8,
    padding: '4px',
    border: '2px solid white',
    minWidth: '24px',
    minHeight: '24px',
    width: '24px',
    height: '24px',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease-in-out',

    '&:hover': {
        backgroundColor: theme.palette.error.main,
        transform: 'scale(1.1)',
    },
}));
export const CustomBoxForFilePreviewer = styled(Box)(
    ({ theme, width, fullWidth, height }) => ({
        width: width ? width : '100%',
        position: 'relative',
        height: height ? height : '10.25rem',
        //border: `2px dashed ${theme.palette.neutral[600]}`,
        padding: '4px',
        overflow: 'visible', // Ensure delete button is visible

    })
)
export const CustomDotBox = styled(Box)(
    ({ theme, width, error, borderRadius, height }) => ({
        width: width && '100%',
        position: 'relative',
        height: height ?? '9.25rem',
        border: `1px dashed ${theme.palette.neutral[400]}`,
        borderRadius: borderRadius ? borderRadius : '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        borderColor: error && 'red',
    })
)
export const CustomBoxImageText = styled(Box)(({ theme }) => ({
    maxWidth: '14.375rem',
}))
