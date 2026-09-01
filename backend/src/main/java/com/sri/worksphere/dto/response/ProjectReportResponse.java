package com.sri.worksphere.dto.response;

import com.sri.worksphere.entity.ProjectPriority;
import com.sri.worksphere.entity.ProjectStatus;

import java.time.LocalDate;

public record ProjectReportResponse(

        Long projectId,
        String projectName,
        ProjectStatus status,
        Integer progress,
        ProjectPriority priority,
        LocalDate startDate,
        LocalDate endDate,
        String departmentName,
        long totalTasks,
        long completedTasks
) {
}