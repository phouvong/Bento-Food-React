import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import SearchIcon from '@mui/icons-material/Search';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LunchDiningOutlinedIcon from '@mui/icons-material/LunchDiningOutlined';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/styles'
import CustomNextImage from '@/components/CustomNextImage'

const CustomizedTimeline = ({ stepper_content }) => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <Timeline
            // position="right"
            sx={{
                padding: 0,
                [`& .${timelineItemClasses.root}:before`]: {
                    flex: 0,
                    padding: 0,
                },
            }}
        >
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineConnector sx={{ opacity: '0' }} />

                    <TimelineDot
                        sx={{
                            bgcolor: theme.palette.neutral[200],
                            borderWidth: 1,
                            padding: '8px',
                            margin: 0,
                            img: { width: '16px', height: '16px', minWidth: "16px" },
                        }}
                        color="grey"
                        variant="outlined"
                    >
                        <CustomNextImage
                            width={16}
                            height={16}
                            src={stepper_content?.stepper_1_image_full_url}
                            alt="search icon"
                            objectFit="cover"

                        // height={16}
                        />
                    </TimelineDot>
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent
                    sx={{
                        py: '12px',
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            '& .MuiTypography-root': {
                                color: theme.palette.primary.main,
                            }
                        }
                    }}
                >
                    <Typography
                        fontWeight={500}
                        color={theme.palette.neutral[1000]}
                    >
                        {stepper_content?.stepper_title_1}
                    </Typography>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineConnector />
                    <TimelineDot
                        sx={{
                            bgcolor: theme.palette.neutral[200],
                            borderWidth: 1,
                            padding: '8px',
                            margin: 0,
                            img: { width: '16px', height: '16px', minWidth: "16px" },
                        }}
                        color="grey"
                        variant="outlined"
                    >
                        <CustomNextImage
                            width={16}
                            height={16}
                            src={stepper_content?.stepper_2_image_full_url}
                            alt="search icon"
                            objectFit="cover"

                        // height={16}
                        />
                    </TimelineDot>
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent
                    sx={{
                        py: '12px',
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            '& .MuiTypography-root': {
                                color: theme.palette.primary.main,
                            }
                        }
                    }}
                >
                    <Typography
                        fontWeight={500}
                        color={theme.palette.neutral[1000]}
                    >
                        {stepper_content?.stepper_title_2}
                    </Typography>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineConnector />
                    <TimelineDot
                        sx={{
                            bgcolor: theme.palette.neutral[200],
                            borderWidth: 1,
                            padding: '8px',
                            margin: 0,
                            img: { width: '16px', height: '16px', minWidth: "16px" },
                        }}
                        color="grey"
                        variant="outlined"
                    >
                        <CustomNextImage
                            width={16}
                            height={16}
                            src={stepper_content?.stepper_3_image_full_url}
                            alt="search icon"
                            objectFit="cover"

                        // height={16}
                        />
                    </TimelineDot>
                    <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent
                    sx={{
                        py: '12px',
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            '& .MuiTypography-root': {
                                color: theme.palette.primary.main,
                            }
                        }
                    }}
                >
                    <Typography
                        fontWeight={500}
                        color={theme.palette.neutral[1000]}
                    >
                        {stepper_content?.stepper_title_3}
                    </Typography>
                </TimelineContent>
            </TimelineItem>
            <TimelineItem>
                <TimelineSeparator>
                    <TimelineConnector />
                    <TimelineDot
                        sx={{
                            bgcolor: theme.palette.neutral[200],
                            borderWidth: 1,
                            padding: '8px',
                            margin: 0,
                            img: { width: '16px', height: '16px', minWidth: "16px" },
                        }}
                        color="grey"
                        variant="outlined"
                    >
                        <CustomNextImage
                            width={16}
                            height={16}
                            src={stepper_content?.stepper_4_image_full_url}
                            alt="search icon"
                            objectFit="cover"

                        // height={16}
                        />
                    </TimelineDot>
                    <TimelineConnector sx={{ opacity: '0' }} />
                </TimelineSeparator>
                <TimelineContent
                    sx={{
                        py: '12px',
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            '& .MuiTypography-root': {
                                color: theme.palette.primary.main,
                            }
                        }
                    }}
                >
                    <Typography
                        fontWeight={500}
                        color={theme.palette.neutral[1000]}
                    >
                        {stepper_content?.stepper_title_4}
                    </Typography>
                </TimelineContent>
            </TimelineItem>
        </Timeline>
    )
}

export default CustomizedTimeline;