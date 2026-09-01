package com.sri.worksphere.dto.request;

import com.sri.worksphere.entity.TaskPriority;
import com.sri.worksphere.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskRequest(

        @NotBlank(message = "Task title is required")
        @Size(
                min = 3,
                max = 150,
                message = "Task title must be between 3 and 150 characters"
        )
        String title,
        @Size(
                max = 2000,
                message = "Task description cannot exceed 2000 characters"
        )
        String description,

        @NotNull(message = "Task status is required")
        TaskStatus status,

        @NotNull(message = "Task priority is required")
        TaskPriority priority,

        LocalDate dueDate,

        @NotNull(message = "Project ID is required")
        Long projectId,

        Long assigneeId
) {
}