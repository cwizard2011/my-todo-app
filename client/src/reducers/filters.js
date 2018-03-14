import moment from 'moment';
import { 
  visibilityFilters,
  setVisibilityFilter, 
  sortByDate, 
  setEndDate, 
  setStartDate 
} from '../actions/filters'

//FILTERS REDUCER

const visibilityFilterReducer = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    
    case 'SORT_BY_DATE':
      return {
        ...state,
        sortBy: 'date'
      }
    case 'SET_START_DATE':
      return {
        ...state,
        startDate: action.startDate
      }
    case 'SET_END_DATE':
      return {
        ...state,
        endDate: action.endDate
      }
    default:
      return state
  }
}

export default visibilityFilterReducer;