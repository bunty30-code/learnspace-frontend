import { combineReducers, configureStore } from "@reduxjs/toolkit";

import {
  loginUser,
  logoutUser,
  registerUser,
} from "../features/auth/authSlice";
import authReducer from "../features/auth/authSlice";
import studentReducer from "../features/student/studentSlice";
import courseReducer from "../features/student/courseSlice";
import enrollmentReducer from "../features/student/enrollmentSlice";
import lessonReducer from "../features/student/lessonSlice";
import quizReducer from "../features/student/quizSlice";
import projectReducer from "../features/student/projectSlice";
import submissionReducer from "../features/student/submissionSlice";
import certificateReducer from "../features/student/certificateSlice";
import notificationReducer from "../features/student/notificationSlice";
import profileReducer from "../features/student/profileSlice";

import adminOverviewReducer from "../features/admin/adminOverviewSlice";
import adminAnalyticsReducer from "../features/admin/adminAnalyticsSlice";
import adminStudentReducer from "../features/admin/adminStudentSlice";
import adminCourseReducer from "../features/admin/adminCourseSlice";
import adminLessonReducer from "../features/admin/adminLessonSlice";
import adminQuizReducer from "../features/admin/adminQuizSlice";
import adminQuestionReducer from "../features/admin/adminQuestionSlice";
import adminProjectReducer from "../features/admin/adminProjectSlice";
import adminSubmissionReducer from "../features/admin/adminSubmissionSlice";
import adminCertificateReducer from "../features/admin/adminCertificateSlice";

const appReducer = combineReducers({
    auth: authReducer,

    student: studentReducer,
    studentCourses: courseReducer,
    studentEnrollments: enrollmentReducer,
    studentLessons: lessonReducer,
    studentQuiz: quizReducer,
    studentProjects: projectReducer,
    studentSubmissions: submissionReducer,
    studentCertificates: certificateReducer,
    studentNotifications: notificationReducer,
    studentProfile: profileReducer,

    adminOverview: adminOverviewReducer,
    adminAnalytics: adminAnalyticsReducer,
    adminStudents: adminStudentReducer,
    adminCourses: adminCourseReducer,
    adminLessons: adminLessonReducer,
    adminQuizzes: adminQuizReducer,
    adminQuestions: adminQuestionReducer,
    adminProjects: adminProjectReducer,
    adminSubmissions: adminSubmissionReducer,
    adminCertificates: adminCertificateReducer,
});

const rootReducer = (state, action) => {
  if (
    loginUser.fulfilled.match(action) ||
    registerUser.fulfilled.match(action) ||
    logoutUser.fulfilled.match(action) ||
    logoutUser.rejected.match(action)
  ) {
    state = { auth: state?.auth };
  }

  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
