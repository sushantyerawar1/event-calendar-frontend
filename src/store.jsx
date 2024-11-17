import { createStore } from 'redux';
import { combineReducers } from 'redux';
import toggleReducer from './reducers/toggleReducer';

const rootReducer = combineReducers({
    toggle: toggleReducer,
});

const store = createStore(rootReducer);

export default store;
