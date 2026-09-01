package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.LeaveRequestPayload;
import com.sri.worksphere.dto.response.LeaveResponse;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.entity.LeaveRequest;
import com.sri.worksphere.entity.LeaveStatus;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.EmployeeRepository;
import com.sri.worksphere.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public LeaveRequestService(
            LeaveRequestRepository leaveRequestRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {

        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // APPLY LEAVE - ADMIN / MANAGER / GENERAL USE
    // =========================================================

    public LeaveResponse applyLeave(
            Long employeeId,
            LeaveRequestPayload request) {

        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        )
                );

        validateDates(
                request.startDate(),
                request.endDate()
        );

        LeaveRequest leaveRequest = new LeaveRequest(
                employee,
                request.leaveType(),
                request.startDate(),
                request.endDate(),
                request.reason(),
                LeaveStatus.PENDING
        );

        LeaveRequest saved =
                leaveRequestRepository.save(leaveRequest);

        return toResponse(saved);
    }

    // =========================================================
    // GET ALL LEAVES
    // =========================================================

    public List<LeaveResponse> getAllLeaves() {

        return leaveRequestRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET LEAVES BY EMPLOYEE
    // =========================================================

    public List<LeaveResponse> getEmployeeLeaves(
            Long employeeId) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        )
                );

        return leaveRequestRepository
                .findByEmployeeId(employeeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET PENDING LEAVES
    // =========================================================

    public List<LeaveResponse> getPendingLeaves() {

        return leaveRequestRepository
                .findByStatus(LeaveStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET LEAVE BY ID
    // =========================================================

    public LeaveResponse getLeaveById(Long id) {

        LeaveRequest leaveRequest =
                leaveRequestRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Leave request not found"
                                )
                        );

        return toResponse(leaveRequest);
    }

    // =========================================================
    // APPROVE LEAVE
    // =========================================================

    public LeaveResponse approveLeave(Long id) {

        LeaveRequest leaveRequest =
                findLeave(id);

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending leave requests can be approved"
            );
        }

        leaveRequest.setStatus(
                LeaveStatus.APPROVED
        );

        LeaveRequest saved =
                leaveRequestRepository.save(leaveRequest);

        // Notify the employee
        notificationService.createNotification(
                leaveRequest.getEmployee()
                        .getUser()
                        .getId(),
                "Your leave request has been approved"
        );

        return toResponse(saved);
    }

    // =========================================================
    // REJECT LEAVE
    // =========================================================

    public LeaveResponse rejectLeave(Long id) {

        LeaveRequest leaveRequest =
                findLeave(id);

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending leave requests can be rejected"
            );
        }

        leaveRequest.setStatus(
                LeaveStatus.REJECTED
        );

        LeaveRequest saved =
                leaveRequestRepository.save(leaveRequest);

        // Notify the employee
        notificationService.createNotification(
                leaveRequest.getEmployee()
                        .getUser()
                        .getId(),
                "Your leave request has been rejected"
        );

        return toResponse(saved);
    }

    // =========================================================
    // GET MY LEAVES
    // =========================================================

    public List<LeaveResponse> getMyLeaves(Long userId) {

        Employee employee = employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile not found"
                        )
                );

        return leaveRequestRepository
                .findByEmployeeId(employee.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // APPLY MY LEAVE
    // Employee ID comes from JWT
    // =========================================================

    public LeaveResponse applyMyLeave(
            Long userId,
            LeaveRequestPayload request) {

        Employee employee = employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile not found"
                        )
                );

        validateDates(
                request.startDate(),
                request.endDate()
        );

        LeaveRequest leaveRequest = new LeaveRequest(
                employee,
                request.leaveType(),
                request.startDate(),
                request.endDate(),
                request.reason(),
                LeaveStatus.PENDING
        );

        LeaveRequest saved =
                leaveRequestRepository.save(leaveRequest);

        return toResponse(saved);
    }

    // =========================================================
    // CANCEL MY LEAVE
    // Employee can cancel ONLY their own pending leave
    // =========================================================

    public LeaveResponse cancelMyLeave(
            Long userId,
            Long leaveId) {

        Employee employee = employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile not found"
                        )
                );

        LeaveRequest leaveRequest =
                leaveRequestRepository
                        .findById(leaveId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Leave request not found"
                                )
                        );

        // Make sure the leave belongs to this employee
        if (!leaveRequest.getEmployee()
                .getId()
                .equals(employee.getId())) {

            throw new IllegalStateException(
                    "You can only cancel your own leave"
            );
        }

        // Only PENDING leave can be cancelled
        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException(
                    "Only pending leave requests can be cancelled"
            );
        }

        leaveRequest.setStatus(
                LeaveStatus.CANCELLED
        );

        return toResponse(
                leaveRequestRepository.save(leaveRequest)
        );
    }

    // =========================================================
    // FIND LEAVE
    // =========================================================

    private LeaveRequest findLeave(Long id) {

        return leaveRequestRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Leave request not found"
                        )
                );
    }

    // =========================================================
    // DATE VALIDATION
    // =========================================================

    private void validateDates(
            LocalDate startDate,
            LocalDate endDate) {

        if (endDate.isBefore(startDate)) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        if (startDate.isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Leave cannot start in the past"
            );
        }
    }

    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private LeaveResponse toResponse(
            LeaveRequest leaveRequest) {

        Employee employee =
                leaveRequest.getEmployee();

        return new LeaveResponse(
                leaveRequest.getId(),
                employee.getId(),
                employee.getUser().getName(),
                leaveRequest.getLeaveType(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.getReason(),
                leaveRequest.getStatus()
        );
    }
}