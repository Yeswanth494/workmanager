package com.sri.worksphere.dto.response;

public record LoginResponse(
        String token,
        UserResponse user
) {
}