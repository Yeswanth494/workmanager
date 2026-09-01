package com.sri.worksphere.repository;

import com.sri.worksphere.entity.LeaveRequest;
import com.sri.worksphere.entity.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sri.worksphere.entity.LeaveStatus;
import java.util.List;

public interface LeaveRequestRepository
        extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeId(Long employeeId);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByEmployeeIdAndStatus(
            Long employeeId,
            LeaveStatus status
    );

    long countByEmployeeId(Long employeeId);
    long countByStatus(LeaveStatus status);
}