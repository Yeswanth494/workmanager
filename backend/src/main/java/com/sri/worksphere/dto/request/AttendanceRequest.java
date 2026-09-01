package com.sri.worksphere.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AttendanceRequest(

        @NotNull(message = "Attendance date is required")
        LocalDate attendanceDate
) {
}