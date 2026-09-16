import React from 'react'

const CouponTicketIcon = ({ size = 20 }) => {
    return (
        <svg
            width={size}
            height={(size * 15) / 20}
            viewBox="0 0 20 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M17.5 15H2.5C1.11917 15 0 13.8808 0 12.5V9.16667L0.913333 9.16917C1.83 9.145 2.56833 8.45667 2.56833 7.53417C2.56833 6.61167 1.83167 5.86 0.916667 5.83417L0 5.83667V2.5C0 1.11917 1.11917 0 2.5 0H17.5C18.8808 0 20 1.11917 20 2.5V5.83333H19.26C18.4292 5.83333 17.6583 6.39917 17.5233 7.21833C17.3517 8.26167 18.155 9.16667 19.1667 9.16667H20V12.5C20 13.8808 18.8808 15 17.5 15Z"
                fill="currentColor"
            />
        </svg>
    )
}

export default CouponTicketIcon
