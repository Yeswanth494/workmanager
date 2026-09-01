package com.sri.worksphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EmployeeRequest(

        @NotBlank
        String employeeCode,

        String phone,

        @NotNull
        Long departmentId,

        String title,

        @NotNull
        LocalDate joiningDate,

        @NotNull
        Long userId
) {
}