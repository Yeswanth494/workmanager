package com.sri.worksphere.controller;

import com.sri.worksphere.dto.request.TimesheetRequest;
import com.sri.worksphere.dto.response.TimesheetResponse;
import com.sri.worksphere.service.TimesheetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/timesheets")
public class TimesheetController {

    private final TimesheetService timesheetService;

    public TimesheetController(
            TimesheetService timesheetService) {

        this.timesheetService = timesheetService;
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TimesheetResponse>>
    getAllTimesheets() {

        return ResponseEntity.ok(
                timesheetService.getAllTimesheets()
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TimesheetResponse>
    getTimesheetById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                timesheetService.getTimesheetById(id)
        );
    }

    // =========================================================
    // GET MY TIMESHEETS
    // =========================================================

    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TimesheetResponse>>
    getMyTimesheets(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                timesheetService.getMyTimesheets(
                        userId
                )
        );
    }

    // =========================================================
    // CREATE MY TIMESHEET
    // =========================================================

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TimesheetResponse>
    createTimesheet(
            Authentication authentication,
            @Valid @RequestBody TimesheetRequest request) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity
                .status(201)
                .body(
                        timesheetService.createMyTimesheet(
                                userId,
                                request
                        )
                );
    }

    // =========================================================
    // UPDATE MY TIMESHEET
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TimesheetResponse>
    updateTimesheet(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody TimesheetRequest request) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                timesheetService.updateMyTimesheet(
                        userId,
                        id,
                        request
                )
        );
    }

    // =========================================================
    // SUBMIT
    // =========================================================

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TimesheetResponse>
    submitTimesheet(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                timesheetService.submitTimesheet(
                        userId,
                        id
                )
        );
    }

    // =========================================================
    // APPROVE / REJECT
    // =========================================================

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TimesheetResponse>
    approveTimesheet(
            @PathVariable Long id,
            @RequestParam boolean approved) {

        return ResponseEntity.ok(
                timesheetService.approveTimesheet(
                        id,
                        approved
                )
        );
    }
}