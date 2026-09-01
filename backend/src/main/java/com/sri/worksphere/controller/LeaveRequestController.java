package com.sri.worksphere.controller;

import com.sri.worksphere.dto.request.LeaveRequestPayload;
import com.sri.worksphere.dto.response.LeaveResponse;
import com.sri.worksphere.service.LeaveRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(
            LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    // GET ALL LEAVES
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveResponse>> getAllLeaves() {

        return ResponseEntity.ok(
                leaveRequestService.getAllLeaves()
        );
    }

    // GET LEAVE BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveResponse> getLeaveById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveRequestService.getLeaveById(id)
        );
    }

    // GET EMPLOYEE LEAVES
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveResponse>> getEmployeeLeaves(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                leaveRequestService.getEmployeeLeaves(employeeId)
        );
    }

    // GET PENDING LEAVES
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<LeaveResponse>> getPendingLeaves() {

        return ResponseEntity.ok(
                leaveRequestService.getPendingLeaves()
        );
    }

    // GET MY LEAVES
    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<LeaveResponse>> getMyLeaves(
            Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                leaveRequestService.getMyLeaves(userId)
        );
    }

    // APPLY MY LEAVE
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveResponse> applyMyLeave(
            Authentication authentication,
            @Valid @RequestBody LeaveRequestPayload request) {

        Long userId = Long.valueOf(authentication.getName());

        return ResponseEntity
                .status(201)
                .body(
                        leaveRequestService.applyMyLeave(
                                userId,
                                request
                        )
                );
    }

    // APPROVE LEAVE
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveResponse> approveLeave(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveRequestService.approveLeave(id)
        );
    }

    // REJECT LEAVE
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LeaveResponse> rejectLeave(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                leaveRequestService.rejectLeave(id)
        );
    }

    // CANCEL MY LEAVE
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<LeaveResponse> cancelMyLeave(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                leaveRequestService.cancelMyLeave(
                        userId,
                        id
                )
        );
    }
}