package com.sri.worksphere.controller;

import com.sri.worksphere.dto.response.DashboardResponse;
import com.sri.worksphere.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import com.sri.worksphere.dto.response.EmployeeDashboardResponse;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    // GET WORKSPHERE DASHBOARD
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                dashboardService.getDashboard()
        );
    }

// EMPLOYEE DASHBOARD


    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<EmployeeDashboardResponse> getMyDashboard(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                dashboardService.getEmployeeDashboard(userId)
        );
    }
}