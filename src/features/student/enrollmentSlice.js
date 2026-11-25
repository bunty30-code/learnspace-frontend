import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { getApiError } from "../../utils/api";
import {
    getEnrollments,
    enrollInCourse,
    syncEnrollmentProgress,
} from "../../api/studentApi";

/*
|--------------------------------------------------------------------------
| Thunks
|--------------------------------------------------------------------------
*/

export const fetchEnrollments = createAsyncThunk(
    "studentEnrollments/fetchAll",

    async (_, { rejectWithValue }) => {
        try {
            const response = await getEnrollments();

            return {
                enrollments: response.data.enrollments,
                meta: response.data.meta,
            };
        } catch (error) {
            return rejectWithValue(getApiError(error));
        }
    },
    {
        condition: (_, { getState }) => {
            const { loading, loaded } = getState().studentEnrollments;
            return !loading && !loaded;
        },
    },
);

export const startCourse = createAsyncThunk(
    "studentEnrollments/enroll",

    async (courseId, { rejectWithValue }) => {
        try {
            const response = await enrollInCourse(courseId);

            return response.data;
        } catch (error) {
            return rejectWithValue(getApiError(error));
        }
    }
);

export const refreshEnrollmentProgress = createAsyncThunk(
    "studentEnrollments/syncProgress",

    async (id, { rejectWithValue }) => {
        try {
            const response = await syncEnrollmentProgress(id);

            return response.data;
        } catch (error) {
            return rejectWithValue(getApiError(error));
        }
    }
);

/*
|--------------------------------------------------------------------------
| Slice
|--------------------------------------------------------------------------
*/

const enrollmentSlice = createSlice({
    name: "studentEnrollments",

    initialState: {
        enrollments: [],
        meta: null,
        loaded: false,

        enrolling: false,

        loading: false,
        error: null,

        validationErrors: null,
    },

    reducers: {
        clearEnrollmentError: (state) => {
            state.error = null;
            state.validationErrors = null;
        },
        updateEnrollment: (state, action) => {
            const index = state.enrollments.findIndex(
                (enrollment) => enrollment.id === action.payload.id
            );

            if (index !== -1) {
                state.enrollments[index] = {
                    ...state.enrollments[index],
                    ...action.payload,
                };
            }
        },
        invalidateEnrollments: (state) => {
            state.loaded = false;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(fetchEnrollments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchEnrollments.fulfilled, (state, action) => {
                state.loading = false;

                state.enrollments = action.payload.enrollments;
                state.meta = action.payload.meta;
                state.loaded = true;
            })

            .addCase(fetchEnrollments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || null;
            })

            /*
             * ENROLL
             */

            .addCase(startCourse.pending, (state) => {
                state.enrolling = true;
                state.error = null;
                state.validationErrors = null;
            })

            .addCase(startCourse.fulfilled, (state, action) => {
                state.enrolling = false;

                state.enrollments = [
                    ...state.enrollments,
                    action.payload.enrollment,
                ];

                if (state.meta) {
                    state.meta.total += 1;
                }

                toast.success(action.payload.message || "Enrolled in course successfully");
            })

            .addCase(startCourse.rejected, (state, action) => {
                state.enrolling = false;

                state.error = action.payload?.message || null;
                state.validationErrors = action.payload?.errors || null;
                toast.error(action.payload?.message || "Failed to enroll in course.");
            })

            /*
             * SYNC PROGRESS
             */

            .addCase(refreshEnrollmentProgress.pending, (state) => {
                state.error = null;
            })

            .addCase(refreshEnrollmentProgress.rejected, (state, action) => {
                state.error = action.payload?.message || null;
            });
    },
});

export const {
    clearEnrollmentError,
    updateEnrollment,
    invalidateEnrollments,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
