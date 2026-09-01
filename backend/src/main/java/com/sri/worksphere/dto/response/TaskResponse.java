package com.sri.worksphere.dto.response;

import com.sri.worksphere.entity.TaskPriority;
import com.sri.worksphere.entity.TaskStatus;

import java.time.LocalDate;

public record TaskResponse(

        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,

        Long projectId,
        String projectName,

        Long assigneeId,
        String assigneeName
) {
}