import React from 'react'
import { Box, Tooltip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

// title accepts ReactNode so callers can pass a translated <Trans> element
// or a plain string. Defaults to "Verified restaurant" to match the existing
// aria-label.
interface VerifiedBadgeProps {
  size?: number   // px — defaults to 16 to match the original SVG viewport
  sx?: SxProps<Theme>
  title?: React.ReactNode
  // boolean | number because some API endpoints return 0/1. When this prop
  // is explicitly provided and falsy, the badge renders nothing — protects
  // callers from the `0 && <JSX/>` gotcha that prints a literal "0". When
  // `verified` is omitted, the badge always renders (backward compatible).
  verified?: boolean | number
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 16,
  sx,
  title = 'Verified restaurant',
  verified,
}) => {
  if (verified !== undefined && !verified) return null
  return (
  <Tooltip title={title} arrow placement="top">
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        lineHeight: 0,
        cursor: 'help',
        ...sx,
      }}
      aria-label="Verified restaurant"
    >
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Badge background — green shield */}
      <path
        d="M14.4672 5.93923C14.3283 5.8331 14.2197 5.69224 14.1525 5.53083C14.0853 5.36943 14.0618 5.19317 14.0844 5.01979C14.2687 3.57809 14.1532 2.7368 13.708 2.29196C13.2621 1.84675 12.4212 1.7299 10.9802 1.9163C10.8067 1.93818 10.6305 1.91426 10.4691 1.84691C10.3077 1.77956 10.1668 1.67112 10.0604 1.53239C9.23235 0.472799 8.59645 0 7.99855 0C7.40136 0 6.76546 0.472087 5.93744 1.53132C5.83061 1.6696 5.68962 1.77768 5.52834 1.84493C5.36707 1.91218 5.19106 1.93628 5.01764 1.91486C3.1716 1.67577 2.58947 1.98978 2.28981 2.28981C1.84532 2.73394 1.7299 3.57524 1.91414 5.018C1.93664 5.19143 1.91311 5.36772 1.84591 5.52917C1.77871 5.69062 1.67022 5.83154 1.53132 5.9378C0.472439 6.76441 0 7.39993 0 7.99855C0 8.59752 0.472439 9.23343 1.53275 10.0607C1.67169 10.1669 1.78022 10.3077 1.84743 10.4691C1.91463 10.6305 1.93814 10.8068 1.91558 10.9802C1.73131 12.4219 1.84675 13.2632 2.29196 13.708C2.73715 14.1525 3.57739 14.2693 5.01979 14.0837C5.19326 14.0621 5.36935 14.0862 5.53067 14.1535C5.69198 14.2208 5.83293 14.3291 5.93959 14.4676C6.76762 15.5272 7.40351 16 8.00141 16C8.5986 16 9.2345 15.5279 10.0625 14.4687C10.1691 14.3301 10.3101 14.2218 10.4714 14.1545C10.6327 14.0873 10.8089 14.0633 10.9823 14.0851C12.8276 14.3231 13.4098 14.0103 13.7102 13.7102C14.1546 13.2661 14.2701 12.4248 14.0858 10.982C14.0633 10.8086 14.0869 10.6323 14.1541 10.4708C14.2213 10.3094 14.3297 10.1685 14.4686 10.0622C15.5275 9.23559 16 8.60007 16 8.00145C16 7.40241 15.5275 6.76654 14.4672 5.93923Z"
        fill="#019463"
      />
      {/* White checkmark */}
      <path
        d="M6.5464 10.2978L5.21519 8.96642C5.04136 8.79256 4.94372 8.55678 4.94373 8.31093C4.94374 8.06509 5.0414 7.82931 5.21524 7.65547C5.38907 7.48164 5.62498 7.38383 5.87081 7.38381C6.11664 7.38378 6.35241 7.48141 6.52627 7.65521L7.16682 8.29552L9.46872 5.73758C9.55016 5.64708 9.64863 5.57351 9.7585 5.52107C9.86838 5.46863 9.98751 5.43834 10.1091 5.43194C10.2307 5.42555 10.3523 5.44316 10.4671 5.48378C10.5819 5.5244 10.6875 5.58723 10.778 5.66868C10.9607 5.83315 11.0706 6.06345 11.0835 6.30895C11.0965 6.55444 11.0113 6.79502 10.8469 6.97776L7.89118 10.2625C7.80699 10.356 7.70463 10.4315 7.59033 10.4842C7.47604 10.5369 7.35221 10.5658 7.22639 10.5691C7.10057 10.5724 6.97539 10.5501 6.85848 10.5034C6.74158 10.4568 6.63539 10.3868 6.5464 10.2978Z"
        fill="white"
      />
    </svg>
    </Box>
  </Tooltip>
  )
}

export default VerifiedBadge
