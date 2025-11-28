import React, { useState } from 'react';
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style';
import {
    Typography,
    useTheme,
    Tabs,
    Tab,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    Button,
} from '@mui/material';
import { Restaurant, ExpandMore } from '@mui/icons-material';
import { t } from 'i18next';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Link from 'next/link';
import { useSelector } from 'react-redux';

const LandingFaQ = ({ faq_data }) => {
    const theme = useTheme();
    const [value, setValue] = useState(0);
      const { global } = useSelector((state) => state.globalSettings)

    const handleChange = (_event, newValue) => {
        setValue(newValue);
    };

    // ✅ Filter data by user type
    const customerFaqs = faq_data?.faq_data?.filter(f => f.user_type === 'customer') || [];
    const restaurantFaqs = faq_data?.faq_data?.filter(f => f.user_type === 'restaurant') || [];
    const deliverymanFaqs = faq_data?.faq_data?.filter(f => f.user_type === 'deliveryman') || [];

    // ✅ Helper to render accordion items
    const renderFaqs = (list) => (
        list.length > 0 ? (
            list.map((item, index) => (
                <Accordion
                    key={index}
                    sx={{
                        borderRadius: '8px',
                        mb: 2,
                        '&:before': {
                            display: 'none',
                        },
                        '&.Mui-expanded': {
                            margin: '0 0 16px 0',
                        }
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                            backgroundColor: theme.palette.neutral[200],
                            borderRadius: '8px',
                            '&.Mui-expanded': {
                                backgroundColor:  theme.palette.neutral[100],
                                borderRadius: '8px 8px 0 0',
                            }
                        }}
                    >
                        <Typography fontWeight="600">{item.question}</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            backgroundColor: theme.palette.neutral[100],
                            borderRadius: '0 0 8px 8px',
                        }}
                    >
                        <Typography color={theme.palette.neutral[600]}>
                            {item.answer}
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            ))
        ) : (
            <Typography color={theme.palette.neutral[500]} textAlign="center">
                {t('No FAQs available for this category.')}
            </Typography>
        )
    );

    return (
        <CustomStackFullWidth
            sx={{ pb: '50px', pt: {xs:"50px",md:"80px"}, px: '20px', alignItems: 'center' }}
        >
            <Typography
                fontSize={{ xs: '20px', md: '30px' }}
                fontWeight="700"
                mb="10px"
                color={theme.palette.neutral[1000]}
            >
                {faq_data?.faq_section_title || t('Frequently Asked Questions')}
            </Typography>
            <Typography color={theme.palette.neutral[400]} mb="30px" textAlign="center" fontSize={{xs:"14px",md:'16px'}}>
                {faq_data?.faq_section_sub_title || t('Find answers to common questions below')}
            </Typography>

            <Box sx={{ width: '100%', maxWidth: 900 }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    centered
                    sx={{
                        '& .MuiTabs-indicator': { display: 'none' },
                        '& .MuiTab-root': {
                            minHeight: 80,
                            minWidth:{xs:"96px",sm:"115px"},
                            maxWidth:{xs:"96px",sm:"115px"},
                            textTransform: 'none',
                            fontSize: { xs: '12px', sm: '14px' },
                            fontWeight: 500,
                            flexDirection: 'column',
                            paddingInline: { xs:'12px',sm:"20px" },
                            backgroundColor: theme.palette.neutral[200],
                            borderRadius: '5px',
                            margin: '0 4px',
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                            },
                        },
                    }}
                >
                    <Tab icon={<GroupIcon />} label={t('Customer')} />
                    <Tab icon={<Restaurant />} label={t('Restaurant')} />
                    <Tab icon={ <PersonIcon />} label={t('Deliveryman')} />
                </Tabs>

                <Box sx={{ mt: 4, width: '100%' }}>
                    {value === 0 && renderFaqs(customerFaqs)}
                    {value === 1 && renderFaqs(restaurantFaqs)}
                    {value === 2 && renderFaqs(deliverymanFaqs)}
                </Box>
            </Box>

            <Stack
                maxWidth="900px"
                width="100%"
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={'center'}
                gap="20px"
                mt="30px"
                backgroundColor={theme.palette.neutral[200]}
                px="20px"
                py="15px"
                borderRadius="10px"
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            backgroundColor: (theme) => theme.palette.neutral[100],
                            padding: '3px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: { xs: '30px', md: '40px' },
                            height: { xs: '30px', md: '40px' },
                        }}
                    >
                        <QuestionMarkIcon color="primary" />
                    </Box>
                    <Box>
                        <Typography color={theme.palette.neutral[1000]} fontSize={{ xs: '16px', sm: '20px' }} fontWeight="600">
                            {t('Still have questions?')}
                        </Typography>
                        <Typography color={theme.palette.neutral[1000]} fontSize={{ xs: '12px', sm: '14px' }}>
                            {t('We’re just a click away if you have more questions.')}
                        </Typography>
                    </Box>
                </Stack>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'none' }}
                >
                     <Link href={`tel:${global?.phone}`} style={{ textDecoration: 'none',color:"white" }}>
                    {t('Contact Us')}
                    </Link>
                </Button>
            </Stack>
        </CustomStackFullWidth>
    );
};

export default LandingFaQ;
