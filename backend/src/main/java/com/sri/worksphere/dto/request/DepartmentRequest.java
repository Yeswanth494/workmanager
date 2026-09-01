package com.sri.worksphere.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DepartmentRequest(

        @NotBlank(message = "Department name is required")
        String name

) {
}