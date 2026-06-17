import React from 'react'
import {
    Box,
    Dialog,
    DialogContent,
    Drawer,
    IconButton,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'

import useGetProTermsAndConditions, {
    resolveTermsBody,
    resolveTermsTitle,
} from '@/hooks/react-query/pro-plans/useGetProTermsAndConditions'

interface ProTermsModalProps {
    open: boolean
    onClose: () => void
}

// Mimics 3 short paragraphs + a bulleted list — close enough to typical
// T&C content that the layout doesn't visibly jump when the API resolves.
const TermsBodyShimmer: React.FC = () => (
    <Stack spacing={2.5}>
        {[0, 1, 2].map((block) => (
            <Stack spacing={0.75} key={`tc-block-${block}`}>
                <Skeleton variant="text" width="40%" height={18} />
                <Skeleton variant="text" width="100%" height={14} />
                <Skeleton variant="text" width="95%" height={14} />
                <Skeleton variant="text" width="78%" height={14} />
            </Stack>
        ))}
        <Stack spacing={0.75} sx={{ pl: 1.5 }}>
            {[0, 1, 2, 3].map((row) => (
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    key={`tc-li-${row}`}
                >
                    <Skeleton variant="circular" width={6} height={6} />
                    <Skeleton
                        variant="text"
                        height={14}
                        sx={{ flex: 1, maxWidth: `${85 - row * 7}%` }}
                    />
                </Stack>
            ))}
        </Stack>
    </Stack>
)

// Inner body is shared between the desktop Dialog and the mobile Drawer so
// the surface is the only difference between the two presentations.
const TermsBody: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslation()
    const { data, isLoading } = useGetProTermsAndConditions()
    const body = resolveTermsBody(data)
    const apiTitle = resolveTermsTitle(data)

    return (
        <Stack sx={{ height: '100%' }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2.5, pt: 2, pb: 1.5 }}
            >
                <Typography fontSize="18px" fontWeight={700}>
                    {apiTitle || t('Terms and Condition')}
                </Typography>
                <IconButton
                    onClick={onClose}
                    size="small"
                    aria-label={t('Close') as string}
                    sx={{ color: '#9CA3AF', p: 0.5 }}
                >
                    <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Stack>

            <Box
                sx={{
                    px: 2.5,
                    pb: 2.5,
                    flex: 1,
                    overflowY: 'auto',
                }}
            >
                {isLoading ? (
                    <TermsBodyShimmer />
                ) : body ? (
                    <Box
                        sx={{
                            fontSize: '14px',
                            lineHeight: 1.65,
                            color: 'text.primary',
                            '& p': { m: 0, mb: 1.25 },
                            '& ul, & ol': { pl: 3, mb: 1.25 },
                            '& li': { mb: 0.5 },
                            '& a': { color: 'primary.main' },
                        }}
                        dangerouslySetInnerHTML={{ __html: body }}
                    />
                ) : (
                    <Typography color="text.secondary">
                        {t('No terms available.')}
                    </Typography>
                )}
            </Box>
        </Stack>
    )
}

const ProTermsModal: React.FC<ProTermsModalProps> = ({ open, onClose }) => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    if (isMobile) {
        return (
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                PaperProps={{
                    sx: {
                        borderTopLeftRadius: '16px',
                        borderTopRightRadius: '16px',
                        height: '80vh',
                    },
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 4,
                        backgroundColor: '#E5E7EB',
                        borderRadius: '999px',
                        mx: 'auto',
                        mt: 1,
                    }}
                />
                <TermsBody onClose={onClose} />
            </Drawer>
        )
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    maxHeight: '80vh',
                },
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <TermsBody onClose={onClose} />
            </DialogContent>
        </Dialog>
    )
}

export default ProTermsModal
