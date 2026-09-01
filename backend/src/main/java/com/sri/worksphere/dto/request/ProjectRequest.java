package com.sri.worksphere.dto.request;

import com.sri.worksphere.entity.ProjectPriority;
import com.sri.worksphere.entity.ProjectStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ProjectRequest(

        @NotBlank(message = "Project name is required")
        String name,

        String description,

        @NotNull(message = "Project status is required")
        ProjectStatus status,

        @NotNull(message = "Project progress is required")
        @Min(value = 0, message = "Progress cannot be less than 0")
        @Max(value = 100, message = "Progress cannot exceed 100")
        Integer progress,

        LocalDate startDate,

        LocalDate endDate,

        @NotNull(message = "Project priority is required")
        ProjectPriority priority,

        @NotNull(message = "Manager ID is required")
        Long managerId,

        @NotNull(message = "Department ID is required")
        Long departmentId
) {
}