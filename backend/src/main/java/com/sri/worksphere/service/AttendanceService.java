package com.sri.worksphere.service;

import com.sri.worksphere.dto.response.AttendanceResponse;
import com.sri.worksphere.entity.Attendance;
import com.sri.worksphere.entity.AttendanceStatus;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.AttendanceRepository;
import com.sri.worksphere.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // CHECK IN
    // =========================================================

    public AttendanceResponse checkIn(Long userId) {

        Employee employee = findEmployeeByUserId(userId);

        LocalDate today = LocalDate.now();

        // Prevent duplicate attendance for the same day
        if (attendanceRepository
                .findByEmployeeIdAndAttendanceDate(
                        employee.getId(),
                        today
                )
                .isPresent()) {

            throw new IllegalStateException(
                    "Attendance already marked for today"
            );
        }

        LocalDateTime now = LocalDateTime.now();

        AttendanceStatus status;

        /*
         * Before 09:30 AM → PRESENT
         * 09:30 AM or later → LATE
         */
        if (now.toLocalTime()
                .isBefore(LocalTime.of(9, 30))) {

            status = AttendanceStatus.PRESENT;

        } else {

            status = AttendanceStatus.LATE;
        }

        Attendance attendance = new Attendance(
                employee,
                today,
                now,
                null,
                status
        );

        Attendance saved =
                attendanceRepository.save(attendance);

        return toResponse(saved);
    }

    // =========================================================
    // CHECK OUT
    // =========================================================

    public AttendanceResponse checkOut(Long userId) {

        Employee employee = findEmployeeByUserId(userId);

        LocalDate today = LocalDate.now();

        Attendance attendance =
                attendanceRepository
                        .findByEmployeeIdAndAttendanceDate(
                                employee.getId(),
                                today
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "No attendance record found for today"
                                )
                        );

        if (attendance.getCheckOut() != null) {

            throw new IllegalStateException(
                    "Already checked out for today"
            );
        }

        attendance.setCheckOut(
                LocalDateTime.now()
        );

        Attendance saved =
                attendanceRepository.save(attendance);

        return toResponse(saved);
    }

    // =========================================================
    // GET MY ATTENDANCE HISTORY
    // =========================================================

    public List<AttendanceResponse> getMyAttendance(
            Long userId) {

        Employee employee =
                findEmployeeByUserId(userId);

        return attendanceRepository
                .findByEmployeeIdOrderByAttendanceDateDesc(
                        employee.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET EMPLOYEE ATTENDANCE
    // =========================================================

    public List<AttendanceResponse> getEmployeeAttendance(
            Long employeeId) {

        employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        )
                );

        return attendanceRepository
                .findByEmployeeIdOrderByAttendanceDateDesc(
                        employeeId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET DAILY ATTENDANCE
    // =========================================================

    public List<AttendanceResponse> getDailyAttendance(
            LocalDate date) {

        return attendanceRepository
                .findByAttendanceDate(date)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // FIND EMPLOYEE USING JWT USER ID
    // =========================================================

    private Employee findEmployeeByUserId(Long userId) {

        return employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile not found"
                        )
                );
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private AttendanceResponse toResponse(
            Attendance attendance) {

        Employee employee =
                attendance.getEmployee();

        return new AttendanceResponse(
                attendance.getId(),
                employee.getId(),
                employee.getUser().getName(),
                attendance.getAttendanceDate(),
                attendance.getCheckIn(),
                attendance.getCheckOut(),
                attendance.getStatus()
        );
    }
}