package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.TaskRequest;
import com.sri.worksphere.dto.response.TaskResponse;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.entity.Project;
import com.sri.worksphere.entity.Task;
import com.sri.worksphere.entity.TaskStatus;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.EmployeeRepository;
import com.sri.worksphere.repository.ProjectRepository;
import com.sri.worksphere.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            EmployeeRepository employeeRepository,
            NotificationService notificationService) {

        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET ALL TASKS
    // =========================================================

    public List<TaskResponse> getAllTasks() {

        return taskRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET TASKS FOR LOGGED-IN EMPLOYEE
    public List<TaskResponse> getTasksForUser(Long userId) {

        Employee employee = employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile not found"
                        )
                );

        return taskRepository
                .findByAssigneeId(employee.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET TASK BY ID
    // =========================================================

    public TaskResponse getTaskById(Long id) {

        Task task = taskRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found"
                        )
                );

        return toResponse(task);
    }
    public TaskResponse getTaskByIdForUser(
            Long id,
            Long userId,
            boolean employee) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Task not found"));

        if (employee) {

            if (task.getAssignee() == null
                    || task.getAssignee().getUser() == null
                    || !task.getAssignee()
                    .getUser()
                    .getId()
                    .equals(userId)) {

                throw new AccessDeniedException(
                        "You can only access tasks assigned to you");
            }
        }

        return toResponse(task);
    }

    // =========================================================
    // GET TASKS BY PROJECT
    // =========================================================

    public List<TaskResponse> getTasksByProject(Long projectId) {

        projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET TASKS ASSIGNED TO EMPLOYEE
    // =========================================================

    public List<TaskResponse> getTasksByAssignee(Long employeeId) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        )
                );

        return taskRepository.findByAssigneeId(employeeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // CREATE TASK
    // =========================================================

    public TaskResponse createTask(TaskRequest request) {

        Project project = projectRepository
                .findById(request.projectId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        Employee assignee = null;

        if (request.assigneeId() != null) {

            assignee = employeeRepository
                    .findById(request.assigneeId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Employee not found"
                            )
                    );
        }

        Task task = new Task(
                request.title(),
                request.description(),
                request.status(),
                request.priority(),
                request.dueDate(),
                project,
                assignee
        );

        Task savedTask =
                taskRepository.save(task);

        // Notify assigned employee
        if (assignee != null) {

            notificationService.createNotification(
                    assignee.getUser().getId(),
                    "New task assigned to you: "
                            + savedTask.getTitle()
            );
        }

        return toResponse(savedTask);
    }

    // =========================================================
    // UPDATE TASK
    // =========================================================

    public TaskResponse updateTask(
            Long id,
            TaskRequest request) {

        Task task = taskRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found"
                        )
                );

        Project project = projectRepository
                .findById(request.projectId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        Employee oldAssignee =
                task.getAssignee();

        Employee newAssignee = null;

        if (request.assigneeId() != null) {

            newAssignee = employeeRepository
                    .findById(request.assigneeId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Employee not found"
                            )
                    );
        }

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setProject(project);
        task.setAssignee(newAssignee);

        Task updatedTask =
                taskRepository.save(task);

        // Notify only when assignment changes
        boolean assignmentChanged =
                (oldAssignee == null && newAssignee != null)
                        ||
                        (oldAssignee != null
                                && newAssignee == null)
                        ||
                        (oldAssignee != null
                                && newAssignee != null
                                && !oldAssignee.getId()
                                .equals(newAssignee.getId()));

        if (assignmentChanged
                && newAssignee != null) {

            notificationService.createNotification(
                    newAssignee.getUser().getId(),
                    "A task has been assigned to you: "
                            + updatedTask.getTitle()
            );
        }

        return toResponse(updatedTask);
    }

    // =========================================================
    // DELETE TASK
    // =========================================================

    public void deleteTask(Long id) {

        Task task = taskRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found"
                        )
                );

        taskRepository.delete(task);
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public TaskResponse updateStatus(
            Long id,
            TaskStatus status,
            Long currentUserId,
            boolean employee) {

        Task task = taskRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found"
                        )
                );

        /*
         * Employees can update only tasks assigned to themselves.
         * Admins and Managers are allowed to update any task.
         */
        if (employee) {

            if (task.getAssignee() == null
                    || task.getAssignee().getUser() == null
                    || !task.getAssignee()
                    .getUser()
                    .getId()
                    .equals(currentUserId)) {

                throw new AccessDeniedException(
                        "You can only update the status of tasks assigned to you"
                );
            }
        }

        TaskStatus oldStatus =
                task.getStatus();

        task.setStatus(status);

        Task updatedTask =
                taskRepository.save(task);

        // Notify employee when task is completed
        if (status == TaskStatus.DONE
                && oldStatus != TaskStatus.DONE
                && updatedTask.getAssignee() != null) {

            notificationService.createNotification(
                    updatedTask.getAssignee()
                            .getUser()
                            .getId(),

                    "Your task has been completed: "
                            + updatedTask.getTitle()
            );
        }

        return toResponse(updatedTask);
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private TaskResponse toResponse(Task task) {

        Long assigneeId = null;
        String assigneeName = null;

        if (task.getAssignee() != null) {

            assigneeId =
                    task.getAssignee().getId();

            assigneeName =
                    task.getAssignee()
                            .getUser()
                            .getName();
        }

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getProject().getId(),
                task.getProject().getName(),
                assigneeId,
                assigneeName
        );
    }
}