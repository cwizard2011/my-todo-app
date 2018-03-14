import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import todosReducer from '../reducers/todos';
import visibilityFilterReducer from '../reducers/filters';
import thunk from 'redux-thunk';
import authReducer from '../reducers/auth';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
// Store creation
export default ()=> {
    const store = createStore(
        combineReducers({
            auth: authReducer,
            todos: todosReducer,
            filters: visibilityFilterReducer
        }),
        composeEnhancers(applyMiddleware(thunk))
        
    );
    return store    
};
