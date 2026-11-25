import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getApiError } from "../../utils/api";
import { getDashboardOverview } from "../../api/adminApi";
import { addCourse, editCourse, removeCourse } from "./adminCourseSlice";
import { addProject, removeProject } from "./adminProjectSlice";
import { submitReview } from "./adminSubmissionSlice";

/*
|--------------------------------------------------------------------------
| Thunks
|--------------------------------------------------------------------------
*/

export const fetchAdminOverview = createAsyncThunk(
    "adminOverview/fetchAll",

    async (_, { rejectWithValue }) => {
        try {
            const response = await getDashboardOverview();
            return response.data;
        } catch (error) {
            return rejectWithValue(getApiError(error));
        }
    },
    {
        condition: (_, { getState }) => {
            const { loading, loaded } = getState().adminOverview;
            return !loading && !loaded;
        },
    },
);

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const adminOverviewSlice = createSlice({
    name: "adminOverview",

    initialState: {
        stats: null,
        recentStudents: [],
        recentSubmissions: [],

        loaded: false,
        loading: false,
        error: null,
    },

    reducers: {
        clearAdminOverviewError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(fetchAdminOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchAdminOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload.stats;
                state.recentStudents = action.payload.recentStudents;
                state.recentSubmissions = action.payload.recentSubmissions;
                state.loaded = true;
            })

            .addCase(fetchAdminOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || null;
            });

        builder
            .addCase(addCourse.fulfilled, (state) => {
                state.loaded = false;
            })
            .addCase(editCourse.fulfilled, (state) => {
                state.loaded = false;
            })
            .addCase(removeCourse.fulfilled, (state) => {
                state.loaded = false;
            })
            .addCase(addProject.fulfilled, (state) => {
                state.loaded = false;
            })
            .addCase(removeProject.fulfilled, (state) => {
                state.loaded = false;
            })
            .addCase(submitReview.fulfilled, (state) => {
                state.loaded = false;
            });
    },
});

export const { clearAdminOverviewError } = adminOverviewSlice.actions;

export default adminOverviewSlice.reducer;
