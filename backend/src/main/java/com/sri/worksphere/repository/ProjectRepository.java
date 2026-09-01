package com.sri.worksphere.repository;

import com.sri.worksphere.entity.Project;
import com.sri.worksphere.entity.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository
        extends JpaRepository<Project, Long> {

    Optional<Project> findByName(String name);

    List<Project> findByManagerId(Long managerId);

    List<Project> findByDepartmentId(Long departmentId);

    List<Project> findByStatus(ProjectStatus status);
}