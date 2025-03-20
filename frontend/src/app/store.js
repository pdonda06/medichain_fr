import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import healthDataReducer from '../features/healthData/healthDataSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    healthData: healthDataReducer,
  },
}); 