package com.sri.worksphere.dto.response;

import com.sri.worksphere.entity.LeaveStatus;
import com.sri.worksphere.entity.LeaveType;

import java.time.LocalDate;

public record LeaveResponse(

        Long id,

        Long employeeId,
        String employeeName,

        LeaveType leaveType,

        LocalDate startDate,
        LocalDate endDate,

        String reason,

        LeaveStatus status
) {
}