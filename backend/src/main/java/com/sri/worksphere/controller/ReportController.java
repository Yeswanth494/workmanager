package com.sri.worksphere.controller;

import com.sri.worksphere.dto.response.ReportSummaryResponse;
import com.sri.worksphere.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.sri.worksphere.dto.response.DepartmentReportResponse;
import com.sri.worksphere.dto.response.ProjectReportResponse;
import com.sri.worksphere.dto.response.EmployeeReportResponse;

import java.util.List;
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(
            ReportService reportService) {

        this.reportService = reportService;
    }

    // =====================================================
    // GET REPORT SUMMARY
    // =====================================================

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ReportSummaryResponse>
    getSummary() {

        return ResponseEntity.ok(
                reportService.getSummary()
        );
    }
    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<DepartmentReportResponse>>
    getDepartmentReport() {

        return ResponseEntity.ok(
                reportService.getDepartmentReport()
        );
    }
    @GetMapping("/projects")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<ProjectReportResponse>>
    getProjectReport() {

        return ResponseEntity.ok(
                reportService.getProjectReport()
        );
    }
    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<EmployeeReportResponse>>
    getEmployeeReport() {

        return ResponseEntity.ok(
                reportService.getEmployeeReport()
        );
    }
}