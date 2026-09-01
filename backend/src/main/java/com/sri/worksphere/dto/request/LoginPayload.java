package com.sri.worksphere.dto.request;

public record LoginPayload(
        String email,
        String password
) {
}