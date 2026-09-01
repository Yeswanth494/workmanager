package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.ProjectRequest;
import com.sri.worksphere.dto.response.ProjectResponse;
import com.sri.worksphere.entity.Department;
import com.sri.worksphere.entity.Project;
import com.sri.worksphere.entity.User;
import com.sri.worksphere.exception.DuplicateResourceException;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.DepartmentRepository;
import com.sri.worksphere.repository.ProjectRepository;
import com.sri.worksphere.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository) {

        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    // GET ALL PROJECTS
    public List<ProjectResponse> getAllProjects() {

        return projectRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET PROJECT BY ID
    public ProjectResponse getProjectById(Long id) {

        Project project = projectRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        return toResponse(project);
    }

    // CREATE PROJECT
    public ProjectResponse createProject(
            ProjectRequest request) {

        if (projectRepository
                .findByName(request.name())
                .isPresent()) {

            throw new DuplicateResourceException(
                    "Project already exists"
            );
        }

        User manager = userRepository
                .findById(request.managerId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Manager not found"
                        )
                );

        if (manager.getRole() != com.sri.worksphere.entity.Role.MANAGER) {
            throw new IllegalArgumentException(
                    "Selected user is not a manager"
            );
        }

        Department department = departmentRepository
                .findById(request.departmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        Project project = new Project(
                request.name(),
                request.description(),
                request.status(),
                request.progress(),
                request.startDate(),
                request.endDate(),
                request.priority(),
                manager,
                department
        );

        Project savedProject =
                projectRepository.save(project);

        return toResponse(savedProject);
    }

    // UPDATE PROJECT
    public ProjectResponse updateProject(
            Long id,
            ProjectRequest request) {

        Project project = projectRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        projectRepository
                .findByName(request.name())
                .filter(existing ->
                        !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "Project already exists"
                    );
                });

        User manager = userRepository
                .findById(request.managerId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Manager not found"
                        )
                );

        if (manager.getRole() != com.sri.worksphere.entity.Role.MANAGER) {
            throw new IllegalArgumentException(
                    "Selected user is not a manager"
            );
        }
        Department department = departmentRepository
                .findById(request.departmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        project.setName(request.name());
        project.setDescription(request.description());
        project.setStatus(request.status());
        project.setProgress(request.progress());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setPriority(request.priority());
        project.setManager(manager);
        project.setDepartment(department);

        Project updatedProject =
                projectRepository.save(project);

        return toResponse(updatedProject);
    }

    // DELETE PROJECT
    public void deleteProject(Long id) {

        Project project = projectRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        projectRepository.delete(project);
    }

    // UPDATE PROJECT STATUS
    public ProjectResponse updateStatus(
            Long id,
            com.sri.worksphere.entity.ProjectStatus status) {

        Project project = projectRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        project.setStatus(status);

        return toResponse(
                projectRepository.save(project)
        );
    }

    // UPDATE PROJECT PROGRESS
    public ProjectResponse updateProgress(
            Long id,
            Integer progress) {

        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException(
                    "Progress must be between 0 and 100"
            );
        }

        Project project = projectRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Project not found"
                        )
                );

        project.setProgress(progress);

        return toResponse(
                projectRepository.save(project)
        );
    }

    // ENTITY → RESPONSE
    private ProjectResponse toResponse(
            Project project) {

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getProgress(),
                project.getStartDate(),
                project.getEndDate(),
                project.getPriority(),
                project.getManager().getId(),
                project.getManager().getName(),
                project.getDepartment().getId(),
                project.getDepartment().getName()
        );
    }
}