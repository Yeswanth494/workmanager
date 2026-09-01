package com.sri.worksphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record EmployeeUpdateRequest(

        @NotBlank
        String phone,

        @NotNull
        Long departmentId,

        @NotBlank
        String title,

        LocalDate joiningDate
) {
}