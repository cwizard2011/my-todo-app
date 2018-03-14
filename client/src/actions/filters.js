import uuid from 'uuid';

// SET VISIBILITY FILTER
export const visibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
}

export const setVisibilityFilter = (filter) => ({
  type: 'SET_VISIBILITY_FILTER',
  filter
});

// SET SORT_BY_DATE
export const sortByDate = () => ({
  type: 'SORT_BY_DATE'
});

// SET_START_DATE
export const setStartDate = ( startDate ) => ({
  type: 'SET_START_DATE',
  startDate
});

//SET_END_DATE
export const setEndDate = ( endDate ) => ({
  type: 'SET_END_DATE',
  endDate
});