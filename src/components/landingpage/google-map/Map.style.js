import { IconButton, styled } from '@mui/material'

export const IconWrapper = styled(IconButton)(({ theme }) => ({
    background: theme.palette.neutral[100],
    '&:hover': {
        background: theme.palette.neutral[100],
    },
    '&.Mui-disabled': {
        background: theme.palette.neutral[200],
    },
}))

export const grayscaleMapStyles = [
    {
        elementType: 'geometry',
        stylers: [{ saturation: -80 }],
    },
    {
        featureType: 'administrative',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#d6e2e6',
            },
        ],
    },
    {
        featureType: 'administrative',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#cfd4d5',
            },
        ],
    },
    {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#7492a8',
            },
        ],
    },
    {
        featureType: 'administrative.neighborhood',
        elementType: 'labels.text.fill',
        stylers: [
            {
                lightness: 25,
            },
        ],
    },
    {
        featureType: 'landscape.man_made',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#dde2e3',
            },
        ],
    },
    {
        featureType: 'landscape.man_made',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#cfd4d5',
            },
        ],
    },
    {
        featureType: 'landscape.natural',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#dde2e3',
            },
        ],
    },
    {
        featureType: 'landscape.natural',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#7492a8',
            },
        ],
    },
    {
        featureType: 'landscape.natural.terrain',
        stylers: [
            {
                visibility: 'off',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#dde2e3',
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'labels.icon',
        stylers: [
            {
                saturation: -100,
            },
        ],
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#588ca4',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#a9de83',
            },
        ],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#bae6a1',
            },
        ],
    },
    {
        featureType: 'poi.sports_complex',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#c6e8b3',
            },
        ],
    },
    {
        featureType: 'poi.sports_complex',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#bae6a1',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [
            {
                saturation: -45,
            },
            {
                lightness: 10,
            },
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#41626b',
            },
        ],
    },
    {
        featureType: 'road.arterial',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#ffffff',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#c1d1d6',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [
            {
                color: '#a6b5bb',
            },
        ],
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [
            {
                visibility: 'on',
            },
        ],
    },
    {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#9fb6bd',
            },
        ],
    },
    {
        featureType: 'road.local',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#ffffff',
            },
        ],
    },
    {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [
            {
                saturation: -70,
            },
        ],
    },
    {
        featureType: 'transit.line',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#b4cbd4',
            },
        ],
    },
    {
        featureType: 'transit.line',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#588ca4',
            },
        ],
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [
            {
                color: '#008cb5',
            },
        ],
    },
    {
        featureType: 'transit.station.airport',
        elementType: 'geometry.fill',
        stylers: [
            {
                saturation: -100,
            },
            {
                lightness: -5,
            },
        ],
    },
    {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [
            {
                color: '#a6cbe3',
            },
        ],
    },
]

// A softer, brand-friendly light theme for the map
export const brandMapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#f5f7fb' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#4a5568' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f7fb' }] },
    {
        featureType: 'administrative.country',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#cbd5e0' }],
    },
    {
        featureType: 'administrative.land_parcel',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#e6f0ff' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#d8f5d4' }],
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#2f855a' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#e2e8f0' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#ffd3bf' }],
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#ffbda6' }],
    },
    {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry',
        stylers: [{ color: '#ffa48a' }],
    },
    {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#4a5568' }],
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#e2e8f0' }],
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#c7e2ff' }],
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#4682b4' }],
    },
]
