package com.sri.worksphere.dto.response;

import com.sri.worksphere.entity.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceResponse(

        Long id,

        Long employeeId,
        String employeeName,

        LocalDate attendanceDate,

        LocalDateTime checkIn,
        LocalDateTime checkOut,

        AttendanceStatus status
) {
}