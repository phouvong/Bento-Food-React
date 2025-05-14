import CloseIcon from '@mui/icons-material/Close'
import { Box, Modal, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { GoogleApi } from '@/hooks/react-query/config/googleApi'
import MapComponent from './MapComponent'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    padding: '1rem',
    width: '845px',
    background: '#FFFFFF',
    borderRadius: '5px',
}

const MapModal = ({ open, handleClose, latitude, longitude, address }) => {
    const { global } = useSelector((state) => state.globalSettings)
    const [searchKey, setSearchKey] = useState('')
    const [enabled, setEnabled] = useState(false)
    const [locationEnabled, setLocationEnabled] = useState(false)
    const [placeId, setPlaceId] = useState('')
    const [location, setLocation] = useState(global?.default_location)
    const [zoneId, setZoneId] = useState(undefined)

    const { data: places, error } = useQuery(
        ['places', searchKey],
        async () => GoogleApi.placeApiAutocomplete(searchKey),
        { enabled },
        {
            retry: 1,
        }
    )
    if (error) {
        setEnabled(false)
    }

    const { data: placeDetails } = useQuery(
        ['placeDetails', placeId],
        async () => GoogleApi.placeApiDetails(placeId),
        { enabled: false },
        {
            retry: 1,
        }
    )

    const { data: zoneData } = useQuery(
        ['zoneId', location],
        async () => GoogleApi.getZoneId(location),
        { enabled: locationEnabled },
        {
            retry: 1,
        }
    )

    useEffect(() => {
        if (zoneData) {
            setZoneId(zoneData?.data?.zone_id)
            setLocationEnabled(false)
        }
        if (!zoneData) {
            setZoneId(undefined)
        }
    }, [zoneData])
    useEffect(() => {
        if (placeDetails) {
            setLocation(placeDetails?.data?.result?.geometry?.location)
            setLocationEnabled(true)
        }
    }, [placeDetails])
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (zoneId) {
                localStorage.setItem('zoneid', zoneId)
            }
        }
    }, [zoneId])

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableAutoFocus={true}
        >
            <Box sx={style} className="modalresposive">
                <Box
                    spacing={2}
                    className="mapsearch"
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                    }}
                >
                    <button onClick={handleClose} className="closebtn">
                        <CloseIcon sx={{ fontSize: '16px' }} />
                    </button>
                </Box>
                <Stack paddingTop>
                    <Typography align="center">{address}</Typography>
                </Stack>

                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    <MapComponent latitude={latitude} longitude={longitude} />
                </Typography>
            </Box>
        </Modal>
    )
}

export default MapModal
