import React, { useEffect, useState } from 'react'
import { IconButton, Stack } from '@mui/material'
import CustomImageContainer from '../CustomImageContainer'
import { useTheme } from '@mui/material/styles'
import CancelIcon from '@mui/icons-material/Cancel'
import AttachmentBox from '@/components/chat/AttachmentBox'

export const isImageType = (file) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    const fileExtension = file?.name?.split('.').pop().toLowerCase()
    return imageExtensions.includes(fileExtension)
}

const ChatImage = ({ body, removeImage }) => {
    const theme = useTheme()
    const [files, setFiles] = useState([])

    useEffect(() => {
        setFiles(body.file)
    }, [body.file])

    return (
        <Stack
            sx={{
                width: '99%',
                position: 'absolute',
                bottom: 78,
                padding: '14px 5px 5px 10px',
                display: 'flex',
                flexDirection: 'row',
                gap: '20px',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                background: (theme) => theme.palette.background.paper,
                [theme.breakpoints.between('xs', 'sm')]: {
                    // styles
                    bottom: 77,
                    width: '98%',
                    gap: '10px',
                },
            }}
        >
            {files?.map((item) => (
                <Stack
                    key={item.name}
                    sx={{ width: 'auto' }}
                    direction="row"
                    alignItems="center"
                >
                    {isImageType(item) ? (
                        <Stack sx={{ position: 'relative' }}>
                            <CustomImageContainer
                                objectFit="cover"
                                src={URL.createObjectURL(item)}
                                height="40px"
                                width="40px"
                                borderRadius=".5rem"
                                smWidth="40px"
                                smHeight="40px"
                            />
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    right: -10,
                                    top: -10,
                                    padding: '0px',
                                    borderRadius: '0px',
                                    color: (theme) =>
                                        theme.palette.neutral[400],
                                }}
                                onClick={() => removeImage(item.name)}
                            >
                                <CancelIcon
                                    fontSize="small"
                                    sx={{ color: theme.palette.neutral[400] }}
                                />
                            </IconButton>
                        </Stack>
                    ) : (
                        <AttachmentBox item={item} removeImage={removeImage} />
                    )}
                </Stack>
            ))}
        </Stack>
    )
}

export default ChatImage
