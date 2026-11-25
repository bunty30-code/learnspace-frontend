import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { getApiError } from "../../utils/api";
import {
    getCourseLessons,
    getLesson,
    markLessonComplete,
} from "../../api/studentApi";

/*
|--------------------------------------------------------------------------
| Thunks
|--------------------------------------------------------------------------
*/

export const fetchCourseLessons = createAsyncThunk(
    "studentLessons/fetchByCourse",

    async (courseId, { rejectWithValue }) => {
        try {
            const response = await getCourseLessons(courseId);

            return {
                lessons: response.data.lessons,
                meta: response.data.meta,
            };
        } catch (error) {
            return rejectWithValue(getApiError(error));
        }
    },
    {
        condition: (courseId, { getState }) => {
            const { courseLessonsLoading, loadedCourseId } = getState().studentLessons;
            return !courseLessonsLoading && loadedCourseId !== courseId;
        },
    },
);

export const fetchLesson = createAsyncThunk(
    "studentLessons/fetchOne",

    async (id, { rejectWithValue }) => {
        try {
            const response = await getLesson(id);

            return {
                lesson: response.data.lesson,
            };
        } catch (error) {
            return rejectWithValue(getApiError(error));
        }
    },
    {
        condition: (id, { getState }) => {
            const { lessonLoading, currentLesson } = getState().studentLessons;
            return !lessonLoading && String(currentLesson?.id) !== String(id);
        },
    },
);

export const completeLesson = createAsyncThunk(
    "studentLessons/complete",

    async (id, { rejectWithValue }) => {
        try {
            const response = await markLessonComplete(id);

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

const initialState = {
    lessons: [],
    meta: null,

    currentLesson: null,

    /*
     * markComplete ke baad backend enrollment bhejta hai
     * (progress + lessons_completed) — use yahan rakhte hai.
     */
    lastCompleted: null,

    loading: false,
    courseLessonsLoading: false,
    lessonLoading: false,
    loadedCourseId: null,

    completing: false,

    error: null,
};

const lessonSlice = createSlice({
    name: "studentLessons",

    initialState,

    reducers: {
        clearCurrentLesson: (state) => {
            state.currentLesson = null;
            state.lastCompleted = null;
        },

        clearLessonError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder

            .addCase(fetchCourseLessons.pending, (state) => {
                state.courseLessonsLoading = true;
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchCourseLessons.fulfilled, (state, action) => {
                state.courseLessonsLoading = false;
                state.loading = state.lessonLoading;

                state.lessons = action.payload.lessons;
                state.meta = action.payload.meta;
                state.loadedCourseId = action.meta.arg;
            })

            .addCase(fetchCourseLessons.rejected, (state, action) => {
                state.courseLessonsLoading = false;
                state.loading = state.lessonLoading;
                state.error = action.payload?.message || null;
            })

            .addCase(fetchLesson.pending, (state) => {
                state.lessonLoading = true;
                state.loading = true;
                state.error = null;
                state.currentLesson = null;
            })

            .addCase(fetchLesson.fulfilled, (state, action) => {
                state.lessonLoading = false;
                state.loading = state.courseLessonsLoading;
                state.currentLesson = action.payload.lesson;
            })

            .addCase(fetchLesson.rejected, (state, action) => {
                state.lessonLoading = false;
                state.loading = state.courseLessonsLoading;
                state.error = action.payload?.message || null;
            })

            .addCase(completeLesson.pending, (state) => {
                state.completing = true;
                state.error = null;
            })

            .addCase(completeLesson.fulfilled, (state, action) => {
                state.completing = false;

                state.lastCompleted = {
                    message: action.payload.message,
                    enrollment: action.payload.enrollment,
                };
                state.loadedCourseId = null;

                toast.success(action.payload.message || "Lesson marked as complete");
            })

            .addCase(completeLesson.rejected, (state, action) => {
                state.completing = false;
                state.error = action.payload?.message || null;
                toast.error(action.payload?.message || "Failed to complete lesson.");
            });
    },
});

export const { clearCurrentLesson, clearLessonError } = lessonSlice.actions;

export default lessonSlice.reducer;
