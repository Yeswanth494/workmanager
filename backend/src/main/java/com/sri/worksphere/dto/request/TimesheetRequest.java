package com.sri.worksphere.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TimesheetRequest(

        @NotNull(message = "Project ID is required")
        Long projectId,

        Long taskId,

        @NotNull(message = "Work date is required")
        LocalDate workDate,

        @NotNull(message = "Hours are required")
        @DecimalMin(
                value = "0.1",
                message = "Hours must be greater than 0"
        )
        @DecimalMax(
                value = "24.0",
                message = "Hours cannot exceed 24"
        )
        Double hours,

        @Size(
                max = 2000,
                message = "Description cannot exceed 2000 characters"
        )
        String description
) {
}