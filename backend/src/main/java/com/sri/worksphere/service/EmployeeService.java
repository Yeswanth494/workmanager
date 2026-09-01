package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.EmployeeRequest;
import com.sri.worksphere.dto.request.EmployeeUpdateRequest;
import com.sri.worksphere.dto.response.EmployeeResponse;
import com.sri.worksphere.entity.Department;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.entity.User;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.DepartmentRepository;
import com.sri.worksphere.repository.EmployeeRepository;
import com.sri.worksphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.sri.worksphere.repository.LeaveRequestRepository;
import com.sri.worksphere.repository.AttendanceRepository;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AttendanceRepository attendanceRepository;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            LeaveRequestRepository leaveRequestRepository,
            AttendanceRepository attendanceRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        )
                );

        return toResponse(employee);
    }

//    public EmployeeResponse createEmployee(EmployeeRequest request) {
//
//        if (employeeRepository
//                .findByEmployeeCode(request.employeeCode())
//                .isPresent()) {
//
//            throw new IllegalArgumentException(
//                    "Employee code already exists"
//            );
//        }
//
//        User user = userRepository
//                .findById(request.userId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "User not found"
//                        )
//                );
//
//        Department department = departmentRepository
//                .findById(request.departmentId())
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Department not found"
//                        )
//                );
//
//        Employee employee = new Employee(
//                request.employeeCode(),
//                request.phone(),
//                department,
//                request.title(),
//                request.joiningDate(),
//                user
//        );
//
//        Employee savedEmployee =
//                employeeRepository.save(employee);
//
//        return toResponse(savedEmployee);
//    }
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        if (employeeRepository
                .findByEmployeeCode(request.employeeCode())
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Employee code already exists"
            );
        }

        if (employeeRepository
                .findByUserId(request.userId())
                .isPresent()) {

            throw new IllegalArgumentException(
                    "Employee profile already exists for this user"
            );
        }

        User user = userRepository
                .findById(request.userId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        Department department = departmentRepository
                .findById(request.departmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        Employee employee = new Employee(
                request.employeeCode(),
                request.phone(),
                department,
                request.title(),
                request.joiningDate(),
                user
        );

        Employee savedEmployee =
                employeeRepository.save(employee);

        return toResponse(savedEmployee);
    }

    public EmployeeResponse updateEmployee(
            Long id,
            EmployeeUpdateRequest request
    ) {

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        )
                );

        Department department = departmentRepository
                .findById(request.departmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Department not found"
                        )
                );

        employee.setPhone(request.phone());
        employee.setDepartment(department);
        employee.setTitle(request.title());
        employee.setJoiningDate(request.joiningDate());

        Employee updatedEmployee =
                employeeRepository.save(employee);

        return toResponse(updatedEmployee);
    }

    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found"
                        )
                );

        long leaveCount =
                leaveRequestRepository.countByEmployeeId(id);

        long attendanceCount =
                attendanceRepository.countByEmployeeId(id);

        if (leaveCount > 0 || attendanceCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete employee because leave or attendance records exist"
            );
        }

        employeeRepository.delete(employee);
    }

    public EmployeeResponse getEmployeeByUserId(Long userId) {

        Employee employee = employeeRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee profile not found"
                        )
                );

        return toResponse(employee);
    }

    private EmployeeResponse toResponse(Employee employee) {

        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getUser().getName(),
                employee.getUser().getEmail(),
                employee.getPhone(),
                employee.getDepartment().getName(),
                employee.getTitle(),
                employee.getJoiningDate(),
                employee.getUser().getRole()
        );
    }
}