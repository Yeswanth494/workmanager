package com.sri.worksphere.dto.response;

import com.sri.worksphere.entity.Role;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
}