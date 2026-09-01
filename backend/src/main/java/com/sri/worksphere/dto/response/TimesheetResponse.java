package com.sri.worksphere.dto.response;

import com.sri.worksphere.entity.TimesheetStatus;

import java.time.LocalDate;

public record TimesheetResponse(

        Long id,

        Long employeeId,

        String employeeName,

        Long projectId,

        String projectName,

        Long taskId,

        String taskTitle,

        LocalDate workDate,

        Double hours,

        String description,

        TimesheetStatus status
) {
}