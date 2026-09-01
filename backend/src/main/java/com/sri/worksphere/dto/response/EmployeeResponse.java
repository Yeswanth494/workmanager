package com.sri.worksphere.dto.response;
import com.sri.worksphere.entity.Role;
import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String employeeCode,
        String name,
        String email,
        String phone,
        String department,
        String title,
        LocalDate joiningDate,
        Role role
) {
}