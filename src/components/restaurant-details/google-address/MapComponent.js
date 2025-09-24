import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    GoogleMap,
    useJsApiLoader,
    MarkerF,
    InfoWindowF,
    DirectionsRenderer,
} from '@react-google-maps/api';
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    useTheme,
    Stack,
} from '@mui/material';
import { t } from 'i18next';
import { grayscaleMapStyles } from '@/components/landingpage/google-map/Map.style';
import { CustomStackFullWidth } from '@/styled-components/CustomStyles.style';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MapMarker from '@/components/landingpage/google-map/MapMarker';
import RestaurantMarker from '@/components/restaurant-details/RestaurantMarker';
import LatestRestaurantCard from '@/components/restaurant-details/LatestRestaurantCard';

const containerStyle = {
    width: '100%',
    height: '250px',
};

const MapComponent = ({
    latitude,
    longitude,
    data,
    handleRouteToRestaurant,
    customMapStyle,
    resLat,
    resLong,
    isRestaurant,
    userLong,
    userLat,
    order_details,
    tempDistance,
}) => {
    const theme = useTheme();
    const [map, setMap] = useState(null);
    const [zoom, setZoom] = useState(15);
    const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY,
    });

    // Initial center
    const center = useMemo(() => ({
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
    }), [latitude, longitude]);

    const options = useMemo(() => ({
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: grayscaleMapStyles,
    }), []);

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
        setZoom(isRestaurant ? 6 : 15);
    }, [isRestaurant]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleZoomIn = () => {
        if (map && zoom < 21) setZoom(prev => prev + 1);
    };

    const handleZoomOut = () => {
        if (map && zoom > 1) setZoom(prev => prev - 1);
    };

    // Get directions only if user location exists
    const fetchDirections = useCallback(async () => {
        if (window.google && window.google.maps && userLat && userLong) {
            const directionsService = new window.google.maps.DirectionsService();
            const results = await directionsService.route({
                origin: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
                destination: { lat: parseFloat(userLat), lng: parseFloat(userLong) },
                travelMode: window.google.maps.TravelMode.DRIVING,
            });
            setDirectionsResponse(results);
        }
    }, [latitude, longitude, userLat, userLong]); // dependencies

    useEffect(() => {
        fetchDirections();
    }, [userLat, userLong, latitude, longitude]);

    if (!isLoaded) return <CircularProgress />;

    return (
        <CustomStackFullWidth position="relative" className="map">
            {/* Zoom Buttons */}
            <Stack position="absolute" zIndex={1} bottom="20px" left="20px" direction="column" spacing={1}>
                <Stack sx={{ backgroundColor: theme.palette.neutral[1800], borderRadius: '8px' }}>
                    <IconButton onClick={handleZoomIn}><AddIcon sx={{ color: theme.palette.neutral[1000] }} /></IconButton>
                    <Divider variant="middle" sx={{ backgroundColor: 'red', marginInline: '8px' }} />
                    <IconButton onClick={handleZoomOut}><RemoveIcon sx={{ color: theme.palette.neutral[1000] }} /></IconButton>
                </Stack>
            </Stack>

            {/* Restaurant Card */}
            {order_details && data?.[0] && (
                <Stack position="absolute" zIndex={1} bottom="20px" right="20px" direction="column" spacing={1}>
                    <LatestRestaurantCard
                        id={data[0]?.id}
                        image={data[0]?.cover_photo_full_url}
                        logo={data[0]?.logo_full_url}
                        name={data[0]?.name}
                        restaurantImageUrl={global?.base_urls}
                        restaurantDiscount={data[0]?.discount}
                        delivery_fee={data[0]?.delivery_fee}
                        open={data[0]?.open}
                        active={data[0]?.active}
                        delivery_time={data[0]?.delivery_time}
                        discount={data[0]?.discount}
                        characteristics={data[0]?.characteristics}
                        coupons={data[0]?.coupons}
                        slug={data[0]?.slug}
                        zone_id={data[0]?.zone_id}
                        distance={tempDistance}
                        foods_count={data[0]?.foods}
                        order_details={order_details}
                    />
                </Stack>
            )}

            <GoogleMap
                mapContainerStyle={customMapStyle || containerStyle}
                //center={center} // Only initial center
                zoom={zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={options}
            >
                {/* Restaurant Markers */}
                {data?.length > 0 && data.map((restaurant) => (
                    <MarkerF
                        key={restaurant.id}
                        position={{ lat: parseFloat(restaurant.latitude), lng: parseFloat(restaurant.longitude) }}
                        icon={{ url: '/static/location-pins/restaurant_location_icon.svg', scale: 7 }}
                        onClick={() => setHoveredMarkerId(restaurant.id)}
                    >
                        {hoveredMarkerId === restaurant.id && (
                            <InfoWindowF
                                position={{ lat: parseFloat(restaurant.latitude), lng: parseFloat(restaurant.longitude) }}
                                pixelOffset={new window.google.maps.Size(0, -30)}
                            >
                                <Box
                                    sx={{ color: theme.palette.neutral[800], svg: { color: theme.palette.primary.main } }}
                                    onClick={() => handleRouteToRestaurant(restaurant)}
                                >
                                    <Stack direction="row" gap={1} mb={1}>
                                        <Box width="0" flexGrow={1} sx={{ cursor: 'pointer' }}>
                                            {restaurant.name} <Box component="small" color="primary.main">
                                                ({(tempDistance / 1000).toFixed(2)} km {t('away')})
                                            </Box>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" gap={1} fontSize="0.75rem">
                                        <Box width="0" flexGrow={1}>{restaurant.address}</Box>
                                    </Stack>
                                </Box>
                            </InfoWindowF>
                        )}
                    </MarkerF>
                ))}

                {/* Directions */}
                {directionsResponse && (
                    <>
                        <DirectionsRenderer
                            directions={directionsResponse}
                            options={{
                                suppressMarkers: true,
                                polylineOptions: { strokeColor: "#4285F4", strokeOpacity: 0.8, strokeWeight: 5 },
                            }}
                        />

                        {/* Start Marker */}
                        <MarkerF
                            position={{
                                lat: directionsResponse.routes[0].legs[0].start_location.lat(),
                                lng: directionsResponse.routes[0].legs[0].start_location.lng(),
                            }}
                            icon={{ url: "/customer_location_icon.svg", scaledSize: new window.google.maps.Size(30, 30) }}
                        />

                        {/* End Marker */}
                        <MarkerF
                            position={{
                                lat: directionsResponse.routes[0].legs[0].end_location.lat(),
                                lng: directionsResponse.routes[0].legs[0].end_location.lng(),
                            }}
                            icon={{ url: "/deliveryMan_location_icon.svg", scaledSize: new window.google.maps.Size(30, 30) }}
                        />
                    </>
                )}
            </GoogleMap>
        </CustomStackFullWidth>
    );
};

export default MapComponent;
