package com.sri.worksphere.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(
        String message,
        int status,
        LocalDateTime timestamp,
        Map<String, String> errors
) {
}