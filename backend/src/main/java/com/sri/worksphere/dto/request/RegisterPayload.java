package com.sri.worksphere.dto.request;

public record RegisterPayload(
        String name,
        String email,
        String password
) {
}