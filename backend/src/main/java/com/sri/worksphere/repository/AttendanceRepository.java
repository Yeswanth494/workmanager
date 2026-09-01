package com.sri.worksphere.repository;

import com.sri.worksphere.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(
            Long employeeId,
            LocalDate attendanceDate
    );

    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(
            Long employeeId
    );

    List<Attendance> findByAttendanceDate(
            LocalDate attendanceDate
    );

    long countByEmployeeId(Long employeeId);
}