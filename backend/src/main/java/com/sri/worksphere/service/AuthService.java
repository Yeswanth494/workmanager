package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.LoginPayload;
import com.sri.worksphere.dto.request.RegisterPayload;
import com.sri.worksphere.dto.response.LoginResponse;
import com.sri.worksphere.dto.response.UserResponse;
import com.sri.worksphere.entity.Department;
import com.sri.worksphere.entity.Employee;
import com.sri.worksphere.entity.Role;
import com.sri.worksphere.entity.User;
import com.sri.worksphere.repository.DepartmentRepository;
import com.sri.worksphere.repository.EmployeeRepository;
import com.sri.worksphere.repository.UserRepository;
import com.sri.worksphere.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AuthService {

    private static final String DEFAULT_DEPARTMENT = "General";
    private static final String DEFAULT_TITLE = "Employee";

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public UserResponse register(RegisterPayload payload) {

        if (userRepository.findByEmail(payload.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        String hashedPassword =
                passwordEncoder.encode(payload.password());

        User user = new User(
                payload.name(),
                payload.email(),
                hashedPassword,
                Role.EMPLOYEE
        );

        User savedUser = userRepository.save(user);

        /*
         * Every newly registered EMPLOYEE must also have
         * an Employee profile.
         */

        Department department = departmentRepository
                .findByName(DEFAULT_DEPARTMENT)
                .orElseGet(() ->
                        departmentRepository.save(
                                new Department(DEFAULT_DEPARTMENT)
                        )
                );

        String employeeCode = String.format(
                "EMP-%05d",
                savedUser.getId()
        );

        Employee employee = new Employee(
                employeeCode,
                null,
                department,
                DEFAULT_TITLE,
                LocalDate.now(),
                savedUser
        );

        employeeRepository.save(employee);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public LoginResponse login(LoginPayload payload) {

        User user = userRepository.findByEmail(payload.email())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                payload.password(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(token, userResponse);
    }
}