package com.sri.worksphere.dto.response;

import com.sri.worksphere.entity.ProjectPriority;
import com.sri.worksphere.entity.ProjectStatus;

import java.time.LocalDate;

public record ProjectResponse(

        Long id,
        String name,
        String description,
        ProjectStatus status,
        Integer progress,
        LocalDate startDate,
        LocalDate endDate,
        ProjectPriority priority,
        Long managerId,
        String managerName,
        Long departmentId,
        String departmentName
) {
}