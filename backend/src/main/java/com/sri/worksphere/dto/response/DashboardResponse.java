package com.sri.worksphere.dto.response;

public record DashboardResponse(

        long totalEmployees,

        long totalProjects,

        long totalTasks,

        long pendingLeaves,

        long todayPresent,

        long todayAbsent,

        long tasksTodo,

        long tasksInProgress,

        long tasksInReview,

        long tasksCompleted,

        long pendingTimesheets

) {
}