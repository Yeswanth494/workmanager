package com.sri.worksphere.controller;

import com.sri.worksphere.dto.response.AttendanceResponse;
import com.sri.worksphere.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    // =========================================================
    // EMPLOYEE CHECK IN
    // =========================================================

    @PostMapping("/check-in")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkIn(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity
                .status(201)
                .body(
                        attendanceService.checkIn(userId)
                );
    }

    // =========================================================
    // EMPLOYEE CHECK OUT
    // =========================================================

    @PostMapping("/check-out")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<AttendanceResponse> checkOut(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                attendanceService.checkOut(userId)
        );
    }

    // =========================================================
    // MY ATTENDANCE HISTORY
    // =========================================================

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                attendanceService.getMyAttendance(userId)
        );
    }

    // =========================================================
    // EMPLOYEE ATTENDANCE
    // ADMIN / MANAGER
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AttendanceResponse>> getEmployeeAttendance(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                attendanceService.getEmployeeAttendance(
                        employeeId
                )
        );
    }

    // =========================================================
    // DAILY ATTENDANCE
    // ADMIN / MANAGER
    // =========================================================

    @GetMapping("/date/{date}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AttendanceResponse>> getDailyAttendance(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                attendanceService.getDailyAttendance(date)
        );
    }
}