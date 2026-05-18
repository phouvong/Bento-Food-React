import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";
import moment from "moment";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RTL } from "../RTL/RTL";
const Calendar = ({ handleValue, minDate, maxDate, diffStartEnd }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const darkSx = isDark
        ? {
              "& .rdrCalendarWrapper, & .rdrDateDisplayWrapper, & .rdrDefinedRangesWrapper, & .rdrStaticRanges, & .rdrInputRanges":
                  {
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                  },
              "& .rdrDateDisplayItem": {
                  backgroundColor: theme.palette.background.default,
                  borderColor: theme.palette.divider,
                  boxShadow: "none",
                  "& input": {
                      color: theme.palette.text.primary,
                  },
              },
              "& .rdrDateDisplayItemActive": {
                  borderColor: theme.palette.primary.main,
              },
              "& .rdrMonthAndYearPickers select": {
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.default,
              },
              "& .rdrMonthAndYearPickers select:hover": {
                  backgroundColor: theme.palette.action.hover,
              },
              "& .rdrPprevButton, & .rdrNextButton": {
                  backgroundColor: theme.palette.background.default,
                  "& i": {
                      borderColor: `transparent ${theme.palette.text.primary} transparent transparent`,
                  },
              },
              "& .rdrNextButton i": {
                  borderColor: `transparent transparent transparent ${theme.palette.text.primary}`,
              },
              "& .rdrDayNumber span": {
                  color: theme.palette.text.primary,
              },
              "& .rdrDayPassive .rdrDayNumber span": {
                  color: theme.palette.text.disabled,
              },
              "& .rdrDayDisabled": {
                  backgroundColor: "transparent",
                  "& .rdrDayNumber span": {
                      color: theme.palette.text.disabled,
                  },
              },
              "& .rdrWeekDay": {
                  color: theme.palette.text.secondary,
              },
              "& .rdrStaticRange": {
                  backgroundColor: theme.palette.background.paper,
                  borderBottomColor: theme.palette.divider,
                  "&:hover .rdrStaticRangeLabel, &:focus .rdrStaticRangeLabel": {
                      backgroundColor: theme.palette.action.hover,
                  },
              },
              "& .rdrStaticRangeLabel": {
                  color: theme.palette.text.primary,
              },
              "& .rdrInputRangeInput": {
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
              },
              "& .rdrMonthName": {
                  color: theme.palette.text.secondary,
              },
              "& .rdrDayToday .rdrDayNumber span:after": {
                  backgroundColor: theme.palette.primary.main,
              },
          }
        : {};

    const today = new Date();
    const [state, setState] = useState([
        {
            startDate: moment(minDate).toDate(),
            endDate: moment(maxDate).toDate(),
            key: "selection"
        }
    ]);

    const handleOnChange = (ranges) => {
        const { selection } = ranges;
        setState([selection]);
    };
    useEffect(() => {
        if (state[0]?.startDate && state[0]?.endDate) {
            const startDate = moment(state[0]?.startDate);
            const endDate = moment(state[0]?.endDate);
            if (!startDate.isSame(endDate)) {
                handleValue?.(state);
            }
        }
    }, [state]);

    return (
        <RTL direction={'ltr'}>
            <Box sx={darkSx}>
                {minDate && maxDate ? (
                    <DateRangePicker
                        onChange={handleOnChange}
                        showSelectionPreview={false}
                        moveRangeOnFirstSelection={false}
                        months={1}
                        ranges={state}
                        direction="horizontal"
                        minDate={moment(minDate).toDate()}
                        maxDate={moment(maxDate).toDate()}
                    />
                ) : (
                    <DateRangePicker
                        onChange={handleOnChange}
                        showSelectionPreview={false}
                        moveRangeOnFirstSelection={false}
                        months={1}
                        ranges={state}
                        direction="horizontal"
                        minDate={today}
                    />
                )}
            </Box>
        </RTL>

    );
};

Calendar.propTypes = {
    onChange: PropTypes.func,
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date)
};

export default Calendar;
