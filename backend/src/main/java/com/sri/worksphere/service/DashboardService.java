package com.sri.worksphere.service;

import com.sri.worksphere.dto.response.DashboardResponse;
import com.sri.worksphere.dto.response.EmployeeDashboardResponse;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.entity.LeaveRequest;
import com.sri.worksphere.entity.LeaveStatus;
import com.sri.worksphere.entity.Task;
import com.sri.worksphere.entity.TaskStatus;
import com.sri.worksphere.entity.Timesheet;
import com.sri.worksphere.entity.TimesheetStatus;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.AttendanceRepository;
import com.sri.worksphere.repository.EmployeeRepository;
import com.sri.worksphere.repository.LeaveRequestRepository;
import com.sri.worksphere.repository.ProjectRepository;
import com.sri.worksphere.repository.TaskRepository;
import com.sri.worksphere.repository.TimesheetRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;
    private final TimesheetRepository timesheetRepository;

    public DashboardService(
            EmployeeRepository employeeRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            LeaveRequestRepository leaveRequestRepository,
            AttendanceRepository attendanceRepository,
            TimesheetRepository timesheetRepository) {

        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.attendanceRepository = attendanceRepository;
        this.timesheetRepository = timesheetRepository;
    }

    // =========================================================
    // ADMIN / MANAGER DASHBOARD
    // =========================================================

    public DashboardResponse getDashboard() {

        long totalEmployees =
                employeeRepository.count();

        long totalProjects =
                projectRepository.count();

        long totalTasks =
                taskRepository.count();

        long pendingLeaves =
                leaveRequestRepository
                        .countByStatus(LeaveStatus.PENDING);

        long todayPresent =
                attendanceRepository
                        .findByAttendanceDate(LocalDate.now())
                        .size();

        long todayAbsent =
                Math.max(
                        totalEmployees - todayPresent,
                        0
                );

        long tasksTodo =
                taskRepository
                        .countByStatus(TaskStatus.TODO);

        long tasksInProgress =
                taskRepository
                        .countByStatus(TaskStatus.IN_PROGRESS);

        long tasksInReview =
                taskRepository
                        .countByStatus(TaskStatus.REVIEW);

        long tasksCompleted =
                taskRepository
                        .countByStatus(TaskStatus.DONE);
        long pendingTimesheets =
                timesheetRepository
                        .findByStatus(TimesheetStatus.SUBMITTED)
                        .size();

        return new DashboardResponse(
                totalEmployees,
                totalProjects,
                totalTasks,
                pendingLeaves,
                todayPresent,
                todayAbsent,
                tasksTodo,
                tasksInProgress,
                tasksInReview,
                tasksCompleted,
                pendingTimesheets
        );
    }

    // =========================================================
    // EMPLOYEE DASHBOARD
    // =========================================================

    public EmployeeDashboardResponse getEmployeeDashboard(
            Long userId) {

        Employee employee =
                employeeRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee profile not found"
                                )
                        );

        Long employeeId = employee.getId();

        // -----------------------------------------------------
        // TASK STATISTICS
        // -----------------------------------------------------

        List<Task> tasks =
                taskRepository.findByAssigneeId(employeeId);

        long totalTasks = tasks.size();

        long todoTasks =
                tasks.stream()
                        .filter(task ->
                                task.getStatus() ==
                                        TaskStatus.TODO)
                        .count();

        long inProgressTasks =
                tasks.stream()
                        .filter(task ->
                                task.getStatus() ==
                                        TaskStatus.IN_PROGRESS)
                        .count();

        long reviewTasks =
                tasks.stream()
                        .filter(task ->
                                task.getStatus() ==
                                        TaskStatus.REVIEW)
                        .count();

        long completedTasks =
                tasks.stream()
                        .filter(task ->
                                task.getStatus() ==
                                        TaskStatus.DONE)
                        .count();

        // -----------------------------------------------------
        // LEAVE STATISTICS
        // -----------------------------------------------------

        List<LeaveRequest> leaves =
                leaveRequestRepository
                        .findByEmployeeId(employeeId);

        long totalLeaves = leaves.size();

        long pendingLeaves =
                leaves.stream()
                        .filter(leave ->
                                leave.getStatus() ==
                                        LeaveStatus.PENDING)
                        .count();

        long approvedLeaves =
                leaves.stream()
                        .filter(leave ->
                                leave.getStatus() ==
                                        LeaveStatus.APPROVED)
                        .count();

        long rejectedLeaves =
                leaves.stream()
                        .filter(leave ->
                                leave.getStatus() ==
                                        LeaveStatus.REJECTED)
                        .count();

        // -----------------------------------------------------
        // ATTENDANCE STATISTICS
        // -----------------------------------------------------

        long attendanceDays =
                attendanceRepository
                        .findByEmployeeIdOrderByAttendanceDateDesc(
                                employeeId
                        )
                        .size();

        // -----------------------------------------------------
        // TIMESHEET STATISTICS
        // -----------------------------------------------------

        List<Timesheet> timesheets =
                timesheetRepository
                        .findByEmployeeId(employeeId);

        LocalDate today = LocalDate.now();

        LocalDate startOfWeek =
                today.with(
                        DayOfWeek.MONDAY
                );

        double thisWeekLoggedHours =
                timesheets.stream()
                        .filter(timesheet ->
                                timesheet.getWorkDate() != null
                                        &&
                                        !timesheet.getWorkDate()
                                                .isBefore(startOfWeek)
                                        &&
                                        !timesheet.getWorkDate()
                                                .isAfter(today)
                        )
                        .mapToDouble(timesheet ->
                                timesheet.getHours() != null
                                        ? timesheet.getHours()
                                        : 0.0
                        )
                        .sum();

        /*
         * Latest timesheet determines the dashboard status.
         *
         * No timesheet:
         * NOT_SUBMITTED
         *
         * DRAFT:
         * DRAFT
         *
         * SUBMITTED:
         * PENDING_REVIEW
         *
         * APPROVED:
         * APPROVED
         *
         * REJECTED:
         * REJECTED
         */

        String timesheetStatus =
                timesheets.stream()
                        .max(
                                Comparator
                                        .comparing(
                                                Timesheet::getWorkDate,
                                                Comparator.nullsLast(
                                                        Comparator.naturalOrder()
                                                )
                                        )
                                        .thenComparing(
                                                Timesheet::getId,
                                                Comparator.nullsLast(
                                                        Comparator.naturalOrder()
                                                )
                                        )
                        )
                        .map(timesheet ->
                                switch (timesheet.getStatus()) {

                                    case DRAFT ->
                                            "DRAFT";

                                    case SUBMITTED ->
                                            "PENDING_REVIEW";

                                    case APPROVED ->
                                            "APPROVED";

                                    case REJECTED ->
                                            "REJECTED";
                                }
                        )
                        .orElse("NOT_SUBMITTED");

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return new EmployeeDashboardResponse(
                totalTasks,
                todoTasks,
                inProgressTasks,
                reviewTasks,
                completedTasks,

                totalLeaves,
                pendingLeaves,
                approvedLeaves,
                rejectedLeaves,

                attendanceDays,

                thisWeekLoggedHours,
                timesheetStatus
        );
    }
}