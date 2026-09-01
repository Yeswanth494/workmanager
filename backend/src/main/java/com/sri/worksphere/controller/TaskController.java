package com.sri.worksphere.controller;

import com.sri.worksphere.dto.request.TaskRequest;
import com.sri.worksphere.dto.response.TaskResponse;
import com.sri.worksphere.entity.TaskStatus;
import com.sri.worksphere.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // GET ALL TASKS
    // GET TASKS
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<TaskResponse>> getAllTasks(
            Authentication authentication) {

        Long userId =
                Long.parseLong(authentication.getName());

        boolean isEmployee =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_EMPLOYEE"));

        if (isEmployee) {
            return ResponseEntity.ok(
                    taskService.getTasksForUser(userId)
            );
        }

        return ResponseEntity.ok(
                taskService.getAllTasks()
        );
    }

    // GET TASK BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId =
                Long.parseLong(authentication.getName());

        boolean employee =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_EMPLOYEE"));

        return ResponseEntity.ok(
                taskService.getTaskByIdForUser(
                        id,
                        userId,
                        employee
                )
        );
    }

    // GET TASKS BY PROJECT
    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(
            @PathVariable Long projectId) {

        return ResponseEntity.ok(
                taskService.getTasksByProject(projectId)
        );
    }

    // GET TASKS BY EMPLOYEE
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<TaskResponse>> getTasksByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                taskService.getTasksByAssignee(employeeId)
        );
    }

    // CREATE TASK
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request) {

        TaskResponse response =
                taskService.createTask(request);

        return ResponseEntity
                .status(201)
                .body(response);
    }

    // UPDATE TASK
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {

        return ResponseEntity.ok(
                taskService.updateTask(id, request)
        );
    }

    // DELETE TASK
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id) {

        taskService.deleteTask(id);

        return ResponseEntity.noContent().build();
    }

    // UPDATE TASK STATUS
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            org.springframework.security.core.Authentication authentication) {

        Long currentUserId = Long.parseLong(authentication.getName());

        boolean employee =
                authentication.getAuthorities()
                        .stream()
                        .anyMatch(authority ->
                                authority.getAuthority()
                                        .equals("ROLE_EMPLOYEE"));

        return ResponseEntity.ok(
                taskService.updateStatus(
                        id,
                        status,
                        currentUserId,
                        employee
                )
        );
    }
}