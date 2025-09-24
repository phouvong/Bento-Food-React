import CustomContainer from '../container'
import { Stack } from '@mui/system'
import { alpha, Typography, useTheme } from '@mui/material'
import { t } from 'i18next'
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CustomAccordion2 } from '@/styled-components/CustomStyles.style'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useState } from 'react'

const RestaurantRegLandFaq = ({faqs}) => {
    const theme = useTheme();
    const [expandedIndex, setExpandedIndex] = useState(null);

    const handleChange = (index) => {
        setExpandedIndex(prev => (prev === index ? null : index));
    };


    return (
        <>{faqs?.length > 0 && (
            <Stack my={8}>
                <CustomContainer>
                    <Stack mb={4}>
                        <Typography variant="h2" textAlign="center" sx={{ fontSize: { xs: 24, sm: 32 } }} color={theme.palette.neutral[1000]}>
                            {t('Frequently Asked Questions')}
                        </Typography>
                    </Stack>

                    <Stack gap={2}>
                        {faqs?.map((item, index) => (
                            <CustomAccordion2
                                key={index}
                                expanded={expandedIndex === index}
                                onChange={() => handleChange(index)}
                            >
                                <AccordionSummary
                                    expandIcon={
                                        expandedIndex === index ? (
                                            <RemoveIcon
                                                sx={{
                                                    backgroundColor: (theme) => theme.palette.primary.main,
                                                    color: (theme) => theme.palette.neutral[100],
                                                    borderRadius: "10%",
                                                    fontSize:"25px"
                                                }}
                                            />
                                        ) : (
                                            <AddIcon
                                                sx={{
                                                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                                                    color: (theme) => theme.palette.primary.main,
                                                    borderRadius: "10%",
                                                    fontSize:"25px"
                                                }}
                                            />
                                        )
                                    }

                                >
                                    <Typography fontSize={{
                                        xs:"15px",
                                        md:"20px"
                                    }} fontWeight="500" variant="h4">{item?.question}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{fontSize:"14px"}}>
                                    {item?.answer}
                                </AccordionDetails>
                            </CustomAccordion2>
                        ))}
                    </Stack>
                </CustomContainer>
            </Stack>
        ) }</>

    )
}

export default RestaurantRegLandFaq;