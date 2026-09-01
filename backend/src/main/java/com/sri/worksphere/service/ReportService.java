package com.sri.worksphere.service;

import com.sri.worksphere.dto.response.ReportSummaryResponse;
import com.sri.worksphere.entity.LeaveStatus;
import com.sri.worksphere.entity.TaskStatus;
import com.sri.worksphere.entity.TimesheetStatus;
import com.sri.worksphere.repository.AttendanceRepository;
import com.sri.worksphere.repository.EmployeeRepository;
import com.sri.worksphere.repository.LeaveRequestRepository;
import com.sri.worksphere.repository.ProjectRepository;
import com.sri.worksphere.repository.TaskRepository;
import com.sri.worksphere.repository.TimesheetRepository;
import org.springframework.stereotype.Service;
import com.sri.worksphere.dto.response.DepartmentReportResponse;
import com.sri.worksphere.repository.DepartmentRepository;
import com.sri.worksphere.dto.response.ProjectReportResponse;
import com.sri.worksphere.entity.Project;
import com.sri.worksphere.entity.Task;
import com.sri.worksphere.dto.response.EmployeeReportResponse;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.entity.LeaveRequest;

import com.sri.worksphere.entity.Timesheet;
import java.util.List;
import java.time.LocalDate;

@Service
public class ReportService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final TimesheetRepository timesheetRepository;
    private final DepartmentRepository departmentRepository;

    public ReportService(
            EmployeeRepository employeeRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            LeaveRequestRepository leaveRequestRepository,
            AttendanceRepository attendanceRepository,
            TimesheetRepository timesheetRepository,
            DepartmentRepository departmentRepository) {

        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.attendanceRepository = attendanceRepository;
        this.timesheetRepository = timesheetRepository;
        this.departmentRepository = departmentRepository;
    }

    public ReportSummaryResponse getSummary() {

        // =====================================================
        // EMPLOYEES
        // =====================================================

        long totalEmployees =
                employeeRepository.count();

        // =====================================================
        // PROJECTS
        // =====================================================

        long totalProjects =
                projectRepository.count();

        // =====================================================
        // TASKS
        // =====================================================

        long totalTasks =
                taskRepository.count();

        long todoTasks =
                taskRepository.countByStatus(
                        TaskStatus.TODO
                );

        long inProgressTasks =
                taskRepository.countByStatus(
                        TaskStatus.IN_PROGRESS
                );

        long reviewTasks =
                taskRepository.countByStatus(
                        TaskStatus.REVIEW
                );

        long completedTasks =
                taskRepository.countByStatus(
                        TaskStatus.DONE
                );

        // =====================================================
        // LEAVES
        // =====================================================

        long pendingLeaves =
                leaveRequestRepository.countByStatus(
                        LeaveStatus.PENDING
                );

        long approvedLeaves =
                leaveRequestRepository.countByStatus(
                        LeaveStatus.APPROVED
                );

        long rejectedLeaves =
                leaveRequestRepository.countByStatus(
                        LeaveStatus.REJECTED
                );

        // =====================================================
        // ATTENDANCE
        // =====================================================

        long todayPresent =
                attendanceRepository
                        .findByAttendanceDate(
                                LocalDate.now()
                        )
                        .size();

        long todayAbsent =
                Math.max(
                        totalEmployees - todayPresent,
                        0
                );

        // =====================================================
        // TIMESHEETS
        // =====================================================

        long draftTimesheets =
                timesheetRepository
                        .findByStatus(
                                TimesheetStatus.DRAFT
                        )
                        .size();

        long submittedTimesheets =
                timesheetRepository
                        .findByStatus(
                                TimesheetStatus.SUBMITTED
                        )
                        .size();

        long approvedTimesheets =
                timesheetRepository
                        .findByStatus(
                                TimesheetStatus.APPROVED
                        )
                        .size();

        long rejectedTimesheets =
                timesheetRepository
                        .findByStatus(
                                TimesheetStatus.REJECTED
                        )
                        .size();

        // =====================================================
        // RESPONSE
        // =====================================================

        return new ReportSummaryResponse(
                totalEmployees,
                totalProjects,

                totalTasks,
                todoTasks,
                inProgressTasks,
                reviewTasks,
                completedTasks,

                pendingLeaves,
                approvedLeaves,
                rejectedLeaves,

                todayPresent,
                todayAbsent,

                draftTimesheets,
                submittedTimesheets,
                approvedTimesheets,
                rejectedTimesheets
        );
    }
    public List<DepartmentReportResponse> getDepartmentReport() {

        return departmentRepository.findAll()
                .stream()
                .map(department ->
                        new DepartmentReportResponse(
                                department.getId(),
                                department.getName(),
                                employeeRepository.countByDepartmentId(
                                        department.getId()
                                )
                        )
                )
                .toList();
    }
    public List<ProjectReportResponse> getProjectReport() {

        return projectRepository.findAll()
                .stream()
                .map(project -> {

                    List<Task> tasks =
                            taskRepository.findByProjectId(
                                    project.getId()
                            );

                    long totalTasks = tasks.size();

                    long completedTasks = tasks.stream()
                            .filter(task ->
                                    task.getStatus()
                                            == TaskStatus.DONE)
                            .count();

                    String departmentName = null;

                    if (project.getDepartment() != null) {
                        departmentName =
                                project.getDepartment().getName();
                    }

                    return new ProjectReportResponse(
                            project.getId(),
                            project.getName(),
                            project.getStatus(),
                            project.getProgress(),
                            project.getPriority(),
                            project.getStartDate(),
                            project.getEndDate(),
                            departmentName,
                            totalTasks,
                            completedTasks
                    );
                })
                .toList();
    }
    public List<EmployeeReportResponse> getEmployeeReport() {

        return employeeRepository.findAll()
                .stream()
                .map(employee -> {

                    // =============================================
                    // TASKS
                    // =============================================

                    List<Task> tasks =
                            taskRepository.findByAssigneeId(
                                    employee.getId()
                            );

                    long totalTasks =
                            tasks.size();

                    long completedTasks =
                            tasks.stream()
                                    .filter(task ->
                                            task.getStatus()
                                                    == TaskStatus.DONE)
                                    .count();

                    long pendingTasks =
                            totalTasks - completedTasks;

                    // =============================================
                    // LEAVES
                    // =============================================

                    List<LeaveRequest> leaves =
                            leaveRequestRepository
                                    .findByEmployeeId(
                                            employee.getId()
                                    );

                    long totalLeaves =
                            leaves.size();

                    long approvedLeaves =
                            leaves.stream()
                                    .filter(leave ->
                                            leave.getStatus()
                                                    == LeaveStatus.APPROVED)
                                    .count();

                    // =============================================
                    // TIMESHEETS
                    // =============================================

                    List<Timesheet> timesheets =
                            timesheetRepository
                                    .findByEmployeeId(
                                            employee.getId()
                                    );

                    double totalTimesheetHours =
                            timesheets.stream()
                                    .mapToDouble(
                                            Timesheet::getHours
                                    )
                                    .sum();

                    // =============================================
                    // DEPARTMENT
                    // =============================================

                    String departmentName = null;

                    if (employee.getDepartment() != null) {

                        departmentName =
                                employee.getDepartment()
                                        .getName();
                    }

                    // =============================================
                    // EMPLOYEE NAME
                    // =============================================

                    String employeeName =
                            employee.getUser()
                                    .getName();

                    // =============================================
                    // RESPONSE
                    // =============================================

                    return new EmployeeReportResponse(
                            employee.getId(),
                            employee.getEmployeeCode(),
                            employeeName,
                            departmentName,
                            employee.getTitle(),

                            totalTasks,
                            completedTasks,
                            pendingTasks,

                            totalLeaves,
                            approvedLeaves,

                            totalTimesheetHours
                    );
                })
                .toList();
    }
}