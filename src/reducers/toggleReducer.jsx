const initialState = {
    isFetchedFromGoogle: false,
};

const toggleReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'TOGGLE_IS_FETCHED_FROM_GOOGLE':
            return {
                ...state,
                isFetchedFromGoogle: !state.isFetchedFromGoogle,
            };
        default:
            return state;
    }
};

export default toggleReducer;