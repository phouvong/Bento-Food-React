import React from 'react'
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Slide,
} from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import CloseIcon from '@mui/icons-material/Close'

import ChoosePlanContent, {
    PlanDuration,
} from './ChoosePlanContent'

// Re-export `PlanDuration` so existing imports from this module keep working
// after the body moved into ChoosePlanContent.
export type { PlanDuration }

const SlideUpTransition = React.forwardRef<
    HTMLElement,
    TransitionProps & { children: React.ReactElement }
>(function SlideUpTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

interface ProPlanSubscriptionModalProps {
    open: boolean
    onClose: () => void
    onSubscribe?: (plan: PlanDuration) => void
    t: (key: string) => string
    // Forwarded to ChoosePlanContent so the inline free-trial subscribe shows
    // a spinner on its CTA while the mutation is in flight.
    isSubmitting?: boolean
    // Forwarded to ChoosePlanContent — used by the renew / change-plan flow
    // to hide the free-trial option when the customer is already on it.
    hideFreePlans?: boolean
    // Forwarded to ChoosePlanContent — drives the renew vs. shift-plan
    // CTA label. Pass the customer's current plan id when opening from
    // the renew / change-plan trigger; omit for first-time subscription.
    activePlanId?: string
}

const ProPlanSubscriptionModal: React.FC<ProPlanSubscriptionModalProps> = ({
    open,
    onClose,
    onSubscribe,
    t,
    isSubmitting = false,
    hideFreePlans = false,
    activePlanId,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={false}
            TransitionComponent={SlideUpTransition}
            sx={{
                // Bottom-sheet on mobile, centered on desktop.
                '& .MuiDialog-container': {
                    alignItems: { xs: 'flex-end', sm: 'center' },
                },
            }}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: '569px' },
                    maxWidth: { xs: '100%', sm: '569px' },
                    // Cap the height so tall content (FAQs, multiple plans)
                    // never pushes the modal off-screen. On mobile use almost
                    // the full viewport; on desktop leave breathing room.
                    maxHeight: { xs: '90vh', sm: '90vh' },
                    m: { xs: 0, sm: 2 },
                    borderRadius: {
                        xs: '16px 16px 0 0',
                        sm: '16px',
                    },
                    // Hide horizontal overflow; vertical overflow handled by
                    // the inner DialogContent scroll container below.
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            <Box sx={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                <IconButton
                    onClick={onClose}
                    size="small"
                    aria-label={t('Close')}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 1,
                        color: '#9CA3AF',
                        p: 0.5,
                        '&:hover': { backgroundColor: 'transparent' },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <DialogContent
                    sx={{
                        px: {xs:"20px", sm: 5},
                        py: 4,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        // Slim scrollbar so it doesn't visually compete with
                        // the modal content. `scrollbar-width: thin` covers
                        // Firefox; the WebKit pseudo-elements cover Chrome /
                        // Safari / Edge.
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#C4C4C4 transparent',
                        '&::-webkit-scrollbar': {
                            width: '4px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#C4C4C4',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            backgroundColor: '#9CA3AF',
                        },
                    }}
                >
                    <ChoosePlanContent
                        t={t}
                        onSubscribe={onSubscribe}
                        isSubmitting={isSubmitting}
                        hideFreePlans={hideFreePlans}
                        activePlanId={activePlanId}
                    />
                </DialogContent>
            </Box>
        </Dialog>
    )
}

export default ProPlanSubscriptionModal
