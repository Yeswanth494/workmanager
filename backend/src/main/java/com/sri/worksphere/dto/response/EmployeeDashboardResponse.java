package com.sri.worksphere.dto.response;

public record EmployeeDashboardResponse(

        long totalTasks,
        long todoTasks,
        long inProgressTasks,
        long reviewTasks,
        long completedTasks,

        long totalLeaves,
        long pendingLeaves,
        long approvedLeaves,
        long rejectedLeaves,

        long attendanceDays,

        double thisWeekLoggedHours,
        String timesheetStatus

) {
}