package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.DepartmentRequest;
import com.sri.worksphere.dto.response.DepartmentResponse;
import com.sri.worksphere.entity.Department;
import com.sri.worksphere.exception.DuplicateResourceException;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.DepartmentRepository;
import com.sri.worksphere.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository) {

        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
    }

    // GET ALL
    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET BY ID
    public DepartmentResponse getDepartmentById(Long id) {

        Department department = departmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        return toResponse(department);
    }

    // CREATE
    public DepartmentResponse createDepartment(
            DepartmentRequest request) {

        if (departmentRepository
                .findByName(request.name())
                .isPresent()) {

            throw new DuplicateResourceException(
                    "Department already exists"
            );
        }

        Department department =
                new Department(request.name());

        Department savedDepartment =
                departmentRepository.save(department);

        return toResponse(savedDepartment);
    }

    // UPDATE
    public DepartmentResponse updateDepartment(
            Long id,
            DepartmentRequest request) {

        Department department = departmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        departmentRepository
                .findByName(request.name())
                .filter(existing ->
                        !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException(
                            "Department already exists"
                    );
                });

        department.setName(request.name());

        Department updatedDepartment =
                departmentRepository.save(department);

        return toResponse(updatedDepartment);
    }

    // DELETE
    public void deleteDepartment(Long id) {

        Department department = departmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        long employeeCount =
                employeeRepository.countByDepartmentId(id);

        if (employeeCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete department because employees are assigned to it"
            );
        }

        departmentRepository.delete(department);
    }

    // RESPONSE MAPPER
    private DepartmentResponse toResponse(
            Department department) {

        return new DepartmentResponse(
                department.getId(),
                department.getName()
        );
    }
}