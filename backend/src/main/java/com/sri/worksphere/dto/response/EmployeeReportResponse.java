package com.sri.worksphere.dto.response;

public record EmployeeReportResponse(

        Long employeeId,
        String employeeCode,
        String employeeName,
        String departmentName,
        String title,

        long totalTasks,
        long completedTasks,
        long pendingTasks,

        long totalLeaves,
        long approvedLeaves,

        double totalTimesheetHours
) {
}