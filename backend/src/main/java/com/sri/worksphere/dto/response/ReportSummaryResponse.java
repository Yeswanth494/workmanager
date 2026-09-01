package com.sri.worksphere.dto.response;

public record ReportSummaryResponse(

        // Employees
        long totalEmployees,

        // Projects
        long totalProjects,

        // Tasks
        long totalTasks,
        long todoTasks,
        long inProgressTasks,
        long reviewTasks,
        long completedTasks,

        // Leaves
        long pendingLeaves,
        long approvedLeaves,
        long rejectedLeaves,

        // Attendance
        long todayPresent,
        long todayAbsent,

        // Timesheets
        long draftTimesheets,
        long submittedTimesheets,
        long approvedTimesheets,
        long rejectedTimesheets
) {
}