package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.TimesheetRequest;
import com.sri.worksphere.dto.response.TimesheetResponse;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.entity.Project;
import com.sri.worksphere.entity.Task;
import com.sri.worksphere.entity.Timesheet;
import com.sri.worksphere.entity.TimesheetStatus;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.EmployeeRepository;
import com.sri.worksphere.repository.ProjectRepository;
import com.sri.worksphere.repository.TaskRepository;
import com.sri.worksphere.repository.TimesheetRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TimesheetService {

    private final TimesheetRepository timesheetRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public TimesheetService(
            TimesheetRepository timesheetRepository,
            EmployeeRepository employeeRepository,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            NotificationService notificationService) {

        this.timesheetRepository = timesheetRepository;
        this.employeeRepository = employeeRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET ALL TIMESHEETS
    // =========================================================

    public List<TimesheetResponse> getAllTimesheets() {

        return timesheetRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET TIMESHEET BY ID
    // =========================================================

    public TimesheetResponse getTimesheetById(Long id) {

        Timesheet timesheet =
                findTimesheet(id);

        return toResponse(timesheet);
    }

    // =========================================================
    // GET MY TIMESHEETS
    // =========================================================

    public List<TimesheetResponse> getMyTimesheets(
            Long userId) {

        Employee employee =
                getEmployeeByUserId(userId);

        return timesheetRepository
                .findByEmployeeId(employee.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // CREATE MY TIMESHEET
    // =========================================================

    public TimesheetResponse createMyTimesheet(
            Long userId,
            TimesheetRequest request) {

        Employee employee =
                getEmployeeByUserId(userId);

        Project project =
                projectRepository
                        .findById(request.projectId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Project not found"
                                )
                        );

        Task task = null;

        if (request.taskId() != null) {

            task = taskRepository
                    .findById(request.taskId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Task not found"
                            )
                    );

            // Task must belong to selected project
            if (!task.getProject()
                    .getId()
                    .equals(project.getId())) {

                throw new IllegalArgumentException(
                        "Task does not belong to selected project"
                );
            }

            // If task has an assignee, it must be this employee
            if (task.getAssignee() != null
                    && !task.getAssignee()
                    .getId()
                    .equals(employee.getId())) {

                throw new IllegalStateException(
                        "You can only log time for your assigned task"
                );
            }
        }

        validateWorkDate(request.workDate());
        validateHours(request.hours());

        Timesheet timesheet =
                new Timesheet(
                        employee,
                        project,
                        task,
                        request.workDate(),
                        request.hours(),
                        request.description(),
                        TimesheetStatus.DRAFT
                );

        Timesheet saved =
                timesheetRepository.save(timesheet);

        return toResponse(saved);
    }

    // =========================================================
    // UPDATE MY TIMESHEET
    // =========================================================

    public TimesheetResponse updateMyTimesheet(
            Long userId,
            Long id,
            TimesheetRequest request) {

        Employee employee =
                getEmployeeByUserId(userId);

        Timesheet timesheet =
                findTimesheet(id);

        verifyOwnership(
                timesheet,
                employee
        );

        if (timesheet.getStatus()
                != TimesheetStatus.DRAFT) {

            throw new IllegalStateException(
                    "Only draft timesheets can be updated"
            );
        }

        Project project =
                projectRepository
                        .findById(request.projectId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Project not found"
                                )
                        );

        Task task = null;

        if (request.taskId() != null) {

            task = taskRepository
                    .findById(request.taskId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Task not found"
                            )
                    );

            if (!task.getProject()
                    .getId()
                    .equals(project.getId())) {

                throw new IllegalArgumentException(
                        "Task does not belong to selected project"
                );
            }
        }

        validateWorkDate(request.workDate());
        validateHours(request.hours());

        timesheet.setProject(project);
        timesheet.setTask(task);
        timesheet.setWorkDate(request.workDate());
        timesheet.setHours(request.hours());
        timesheet.setDescription(request.description());

        return toResponse(
                timesheetRepository.save(timesheet)
        );
    }

    // =========================================================
    // SUBMIT TIMESHEET
    // =========================================================

    public TimesheetResponse submitTimesheet(
            Long userId,
            Long id) {

        Employee employee =
                getEmployeeByUserId(userId);

        Timesheet timesheet =
                findTimesheet(id);

        verifyOwnership(
                timesheet,
                employee
        );

        if (timesheet.getStatus()
                != TimesheetStatus.DRAFT) {

            throw new IllegalStateException(
                    "Only draft timesheets can be submitted"
            );
        }

        timesheet.setStatus(
                TimesheetStatus.SUBMITTED
        );

        Timesheet saved =
                timesheetRepository.save(timesheet);

        return toResponse(saved);
    }

    // =========================================================
    // APPROVE TIMESHEET
    // =========================================================

    public TimesheetResponse approveTimesheet(
            Long id,
            boolean approved) {

        Timesheet timesheet =
                findTimesheet(id);

        if (timesheet.getStatus()
                != TimesheetStatus.SUBMITTED) {

            throw new IllegalStateException(
                    "Only submitted timesheets can be approved or rejected"
            );
        }

        if (approved) {

            timesheet.setStatus(
                    TimesheetStatus.APPROVED
            );

        } else {

            timesheet.setStatus(
                    TimesheetStatus.REJECTED
            );
        }

        Timesheet saved =
                timesheetRepository.save(timesheet);

        String message;

        if (approved) {

            message =
                    "Your timesheet for "
                            + saved.getWorkDate()
                            + " has been approved";

        } else {

            message =
                    "Your timesheet for "
                            + saved.getWorkDate()
                            + " has been rejected";
        }

        notificationService.createNotification(
                saved.getEmployee()
                        .getUser()
                        .getId(),
                message
        );

        return toResponse(saved);
    }

    // =========================================================
    // FIND TIMESHEET
    // =========================================================

    private Timesheet findTimesheet(Long id) {

        return timesheetRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Timesheet not found"
                        )
                );
    }

    // =========================================================
    // FIND EMPLOYEE BY USER
    // =========================================================

    private Employee getEmployeeByUserId(
            Long userId) {

        return employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile not found"
                        )
                );
    }

    // =========================================================
    // OWNERSHIP
    // =========================================================

    private void verifyOwnership(
            Timesheet timesheet,
            Employee employee) {

        if (!timesheet.getEmployee()
                .getId()
                .equals(employee.getId())) {

            throw new IllegalStateException(
                    "You can only modify your own timesheets"
            );
        }
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateWorkDate(
            LocalDate workDate) {

        if (workDate.isAfter(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Work date cannot be in the future"
            );
        }
    }

    private void validateHours(
            Double hours) {

        if (hours == null
                || hours <= 0
                || hours > 24) {

            throw new IllegalArgumentException(
                    "Hours must be between 0 and 24"
            );
        }
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private TimesheetResponse toResponse(
            Timesheet timesheet) {

        Long taskId = null;
        String taskTitle = null;

        if (timesheet.getTask() != null) {

            taskId =
                    timesheet.getTask().getId();

            taskTitle =
                    timesheet.getTask().getTitle();
        }

        return new TimesheetResponse(
                timesheet.getId(),
                timesheet.getEmployee().getId(),
                timesheet.getEmployee()
                        .getUser()
                        .getName(),
                timesheet.getProject().getId(),
                timesheet.getProject().getName(),
                taskId,
                taskTitle,
                timesheet.getWorkDate(),
                timesheet.getHours(),
                timesheet.getDescription(),
                timesheet.getStatus()
        );
    }
}