import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { BookOpen, Trophy, Bell, ArrowRight } from "lucide-react";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from "recharts";

import Avatar from "../../components/common/Avatar";
import { SkeletonStatCards, SkeletonCardGrid } from "../../components/common/Skeleton";
import { PageHeader, StatCard, AlertBanner, EmptyState } from "../../components/common";
import { ButtonLink } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/Progress";
import Badge, { StatusLabel } from "../../components/ui/Badge";
import { SectionMarker, CornerBrackets } from "../../components/ui/Deco";
import { getChartTheme } from "../../components/charts/chartTheme";
import { TooltipCard } from "../../components/charts/ChartTooltip";
import { useTheme } from "../../theme/themeContext";
import { fetchEnrollments } from "../../features/student/enrollmentSlice";
import { fetchNotifications } from "../../features/student/notificationSlice";

const statsConfig = [
    { key: "enrolled", label: "Enrolled Courses", icon: BookOpen, tone: "accent" },
    { key: "completed", label: "Completed", icon: Trophy, tone: "gold" },
    { key: "unread", label: "Unread Alerts", icon: Bell, tone: "teal" },
];

const StudentDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        enrollments,
        loading: enrollmentsLoading,
        loaded: enrollmentsLoaded,
        error: enrollmentsError,
    } = useSelector((state) => state.studentEnrollments);
    const {
        notifications,
        loading: notificationsLoading,
        loaded: notificationsLoaded,
        error: notificationsError,
    } = useSelector((state) => state.studentNotifications);

    const { mode } = useTheme();
    const theme = getChartTheme(mode);

    useEffect(() => {
        dispatch(fetchEnrollments());
        dispatch(fetchNotifications());
    }, [dispatch]);

    const completedCourses = enrollments.filter((e) => e.completed).length;
    const unreadNotifications = notifications.filter((n) => !n.is_read).length;
    const stats = { enrolled: enrollments.length, completed: completedCourses, unread: unreadNotifications };
    const loadingStats =
        (enrollmentsLoading && !enrollmentsLoaded) ||
        (notificationsLoading && !notificationsLoaded);
    const error = enrollmentsError || notificationsError;
    const statsFailed =
        (enrollmentsError && !enrollmentsLoaded) ||
        (notificationsError && !notificationsLoaded);

    const chartData = enrollments.slice(0, 6).map((enrollment) => ({
        name: (enrollment.course?.title || "Course").slice(0, 12),
        progress: Number(enrollment.progress || 0),
    }));

    /* Bars cycle through a four-stop rotation drawn from the active theme —
       hardcoded hex khatam, day/night dono me the same language. */
    const barTones = [theme.active, theme.done, theme.students, theme.submissions];

    return (
        <div>
            <PageHeader
                eyebrow="learning workspace"
                title={`Welcome back, ${(user?.name || "Student").split(" ")[0]}`}
                subtitle="Continue your learning journey."
                action={
                    <ButtonLink to="/student/courses" size="lg">
                        Browse Courses
                        <ArrowRight size={16} />
                    </ButtonLink>
                }
            >
                <div className="mt-8 flex items-center gap-4">
                    <Avatar
                        name={user?.name}
                        src={user?.profile_image}
                        className="h-12 w-12 text-base"
                    />

                    <div className="min-w-0">
                        <span className="technical-label">Learner profile</span>
                        <p className="mt-1.5 truncate font-display text-sm font-semibold text-fg">
                            {user?.name || "Student"}
                        </p>
                    </div>
                </div>
            </PageHeader>

            {error && <AlertBanner type="error" message={error} />}

            {/* Stats */}
            {loadingStats && !statsFailed ? (
                <SkeletonStatCards count={3} className="sm:grid-cols-3" />
            ) : !statsFailed && enrollmentsLoaded && notificationsLoaded && (
                <section className="grid gap-4 sm:grid-cols-3">
                    {statsConfig.map((stat) => (
                        <StatCard
                            key={stat.key}
                            icon={stat.icon}
                            label={stat.label}
                            value={stats[stat.key]}
                            tone={stat.tone}
                        />
                    ))}
                </section>
            )}

            {/* My Courses */}
            <section className="mt-14">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
                    <SectionMarker index={1}>My Courses</SectionMarker>

                    <Link
                        to="/student/courses"
                        className="text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
                    >
                        View all
                    </Link>
                </div>

                {enrollmentsError && !enrollmentsLoaded ? null : !enrollmentsLoaded ? (
                    <div className="mt-6">
                        <SkeletonCardGrid count={3} />
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="mt-6">
                        <EmptyState
                            icon={BookOpen}
                            title="No courses yet"
                            message="You haven't enrolled in any course yet."
                            action={
                                <ButtonLink to="/student/courses">
                                    Browse Courses
                                </ButtonLink>
                            }
                        />
                    </div>
                ) : (
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((enrollment) => (
                            <Link
                                key={enrollment.id}
                                to={`/student/courses/${enrollment.course_id}`}
                                className="card-hover spotlight group flex h-full flex-col p-5 sm:p-6"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <span className="technical-label line-clamp-1 min-w-0 flex-1">
                                        {enrollment.course?.category || "General"}
                                    </span>

                                    {enrollment.completed && (
                                        <Badge tone="gold" dot className="shrink-0">
                                            Course Completed
                                        </Badge>
                                    )}
                                </div>

                                <h3 className="mt-4 line-clamp-1 font-display text-base font-bold text-fg">
                                    {enrollment.course?.title}
                                </h3>

                                <div className="mt-5">
                                    <div className="mb-2.5 flex items-baseline justify-between gap-3">
                                        <span className="technical-label">Progress</span>
                                        <span className="numeric text-sm font-semibold text-fg">
                                            {Number(enrollment.progress || 0)}%
                                        </span>
                                    </div>

                                    <ProgressBar
                                        value={Number(enrollment.progress || 0)}
                                        tone={enrollment.completed ? "teal" : "accent"}
                                    />
                                </div>

                                <p className="mt-4 text-sm text-muted">
                                    Lessons completed:{" "}
                                    <span className="font-semibold text-fg">
                                        {enrollment.lessons_completed}
                                    </span>
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Progress Chart */}
            {chartData.length > 0 && (
                <section className="mt-14">
                    <SectionMarker index={2}>Course Progress</SectionMarker>

                    <div className="card relative mt-6 overflow-hidden p-6 sm:p-7">
                        <CornerBrackets />

                        <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                            <span className="technical-label">Completion percentage</span>

                            <StatusLabel>{chartData.length} courses tracked</StatusLabel>
                        </div>

                        <div className="relative mt-6 h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 13, fill: theme.tick }} tickLine={false} axisLine={{ stroke: theme.axis }} />
                                    <YAxis tick={{ fontSize: 12, fill: theme.tick }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                    <Tooltip
                                        cursor={{ fill: theme.cursor }}
                                        content={({ active, payload, label }) => {
                                            if (!active || !payload?.length) return null;

                                            return (
                                                <TooltipCard
                                                    title={label}
                                                    rows={[
                                                        {
                                                            label: "Progress",
                                                            value: `${payload[0].value}%`,
                                                            color: barTones[0],
                                                        },
                                                    ]}
                                                />
                                            );
                                        }}
                                    />
                                    <Bar dataKey="progress" radius={[4, 4, 0, 0]} barSize={48}>
                                        {chartData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={barTones[index % barTones.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default StudentDashboard;
