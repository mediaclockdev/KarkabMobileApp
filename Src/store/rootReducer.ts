import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../auth/redux/authSlice';
// import feedReducer from '../features/feed/redux/feedSlice';

const rootReducer = combineReducers({
  auth: authReducer,

//   feed: feedReducer,
  // Add other reducers here
});

export default rootReducer;

