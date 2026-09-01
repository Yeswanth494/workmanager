package com.sri.worksphere.dto.response;

public record DepartmentReportResponse(
        Long departmentId,
        String departmentName,
        long employeeCount
) {
}