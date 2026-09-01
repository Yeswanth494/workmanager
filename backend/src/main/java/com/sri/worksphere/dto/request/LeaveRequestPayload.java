package com.sri.worksphere.dto.request;

import com.sri.worksphere.entity.LeaveType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record LeaveRequestPayload(

        @NotNull(message = "Leave type is required")
        LeaveType leaveType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        String reason
) {
}