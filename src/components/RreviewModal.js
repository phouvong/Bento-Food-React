import React from 'react'
import { useTranslation } from 'react-i18next'
import Dialog from '@mui/material/Dialog'
import { Stack } from '@mui/material'
import Typography from '@mui/material/Typography'
import { WrapperForCustomDialogConfirm } from '@/components/custom-dialog/confirm/CustomDialogConfirm.style'
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style'
import CustomImageContainer from './CustomImageContainer'
import StarIcon from '@mui/icons-material/Star'
import { CustomTypographyGray } from '@/styled-components/CustomTypographies.style'

const ReviewModal = (props) => {
    const { open, onClose, review } = props

    const { t } = useTranslation()
    const imageUrl = `${review.food_image_full_url}`
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <WrapperForCustomDialogConfirm>
                <CustomStackFullWidth direction="row" spacing={1}>
                    <Stack width="22%" height="100px">
                        <CustomImageContainer
                            src={imageUrl}
                            alt={review.food_name}
                            width="100%"
                            height="100px"
                            smHeight="70px"
                            objectFit="contained"
                            borderRadius=".7rem"
                        />
                    </Stack>
                    <Stack width="78%" paddingRight="10px">
                        <Typography variant="h5">{review.food_name}</Typography>
                        <Typography variant="h5">
                            {review.rating}
                            <StarIcon sx={{ width: '16px', color: 'orange' }} />
                        </Typography>
                        <Typography variant="h6">
                            {review.customer_name}
                        </Typography>
                        <CustomTypographyGray sx={{ fontSize: '13px' }}>
                            {review.comment}
                        </CustomTypographyGray>
                    </Stack>
                </CustomStackFullWidth>
            </WrapperForCustomDialogConfirm>
        </Dialog>
    )
}

ReviewModal.propTypes = {}

export default ReviewModal
