export const additionalInformationInitialState = {
    streetNumber: '',
    houseNumber: '',
    floor: '',
    note: '',
    addressType: '',
    dine_in_contact: {
        name: '',
        phone: '',
        email: '',
    },
}

export const additionalInformationReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.setStreetNumber:
            return {
                ...state,
                streetNumber: action.payload,
            }
        case ACTIONS.setHouseNumber:
            return {
                ...state,
                houseNumber: action.payload,
            }
        case ACTIONS.setFloor:
            return {
                ...state,
                floor: action.payload,
            }
        case ACTIONS.setNote:
            return {
                ...state,
                note: action.payload,
            }
        case ACTIONS.setAddressType:
            return {
                ...state,
                addressType: action.payload,
            }
        case ACTIONS.setDineInName:
            return {
                ...state,
                dine_in_contact: {
                    ...state.dine_in_contact,
                    name: action.payload,
                },
            }
        case ACTIONS.setDineInPhone:
            return {
                ...state,
                dine_in_contact: {
                    ...state.dine_in_contact,
                    phone: action.payload,
                },
            }
        case ACTIONS.setDineInEmail:
            return {
                ...state,
                dine_in_contact: {
                    ...state.dine_in_contact,
                    email: action.payload,
                },
            }
        default:
            return state
    }
}

export const ACTIONS = {
    setStreetNumber: 'setStreetNumber',
    setHouseNumber: 'setHouseNumber',
    setFloor: 'setFloor',
    setNote: 'setNote',
    setAddressType: 'setAddressType',
    setDineInName: 'setDineInName',
    setDineInPhone: 'setDineInPhone',
    setDineInEmail: 'setDineInEmail',
}
