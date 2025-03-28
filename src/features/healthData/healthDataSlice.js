import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import healthDataService from '../../services/healthDataService';

const initialState = {
  healthData: [],
  currentData: null,
  reportData: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  pagination: {
    page: 1,
    limit: 10,
    pages: 1,
    total: 0
  }
};

// Create new health data
export const createHealthData = createAsyncThunk(
  'healthData/create',
  async (healthData, thunkAPI) => {
    try {
      return await healthDataService.createHealthData(healthData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get health data with filters
export const getHealthData = createAsyncThunk(
  'healthData/getAll',
  async (filters, thunkAPI) => {
    try {
      return await healthDataService.getHealthData(filters);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get health data by ID
export const getHealthDataById = createAsyncThunk(
  'healthData/getById',
  async (id, thunkAPI) => {
    try {
      return await healthDataService.getHealthDataById(id);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update health data
export const updateHealthData = createAsyncThunk(
  'healthData/update',
  async ({ id, healthData }, thunkAPI) => {
    try {
      return await healthDataService.updateHealthData(id, healthData);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete health data
export const deleteHealthData = createAsyncThunk(
  'healthData/delete',
  async (id, thunkAPI) => {
    try {
      return await healthDataService.deleteHealthData(id);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get aggregated report
export const getAggregatedReport = createAsyncThunk(
  'healthData/getReport',
  async (filters, thunkAPI) => {
    try {
      return await healthDataService.getAggregatedReport(filters);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'An error occurred';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const healthDataSlice = createSlice({
  name: 'healthData',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentData: (state) => {
      state.currentData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create health data cases
      .addCase(createHealthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createHealthData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.healthData.unshift(action.payload.data);
      })
      .addCase(createHealthData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get all health data cases
      .addCase(getHealthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHealthData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.healthData = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getHealthData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get health data by ID cases
      .addCase(getHealthDataById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getHealthDataById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentData = action.payload.data;
      })
      .addCase(getHealthDataById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update health data cases
      .addCase(updateHealthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateHealthData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update current data if it matches the updated one
        if (state.currentData && state.currentData._id === action.payload.data._id) {
          state.currentData = action.payload.data;
        }
        // Update in the list
        state.healthData = state.healthData.map(item => 
          item._id === action.payload.data._id ? action.payload.data : item
        );
      })
      .addCase(updateHealthData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete health data cases
      .addCase(deleteHealthData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteHealthData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Remove the deleted item from list
        state.healthData = state.healthData.filter(item => 
          item._id !== action.meta.arg
        );
        // Clear current data if it was the deleted one
        if (state.currentData && state.currentData._id === action.meta.arg) {
          state.currentData = null;
        }
      })
      .addCase(deleteHealthData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get aggregated report cases
      .addCase(getAggregatedReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAggregatedReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reportData = action.payload.data;
      })
      .addCase(getAggregatedReport.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearCurrentData } = healthDataSlice.actions;
export default healthDataSlice.reducer; 