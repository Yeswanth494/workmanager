package com.sri.worksphere.repository;

import com.sri.worksphere.entity.Timesheet;
import com.sri.worksphere.entity.TimesheetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimesheetRepository
        extends JpaRepository<Timesheet, Long> {

    List<Timesheet> findByEmployeeId(Long employeeId);

    List<Timesheet> findByStatus(TimesheetStatus status);

    List<Timesheet> findByEmployeeIdAndStatus(
            Long employeeId,
            TimesheetStatus status
    );
}