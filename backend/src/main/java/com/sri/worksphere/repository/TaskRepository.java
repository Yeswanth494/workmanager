package com.sri.worksphere.repository;

import com.sri.worksphere.entity.Task;
import com.sri.worksphere.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssigneeId(Long employeeId);

    List<Task> findByProjectIdAndAssigneeId(
            Long projectId,
            Long employeeId
    );

    long countByStatus(TaskStatus status);
}