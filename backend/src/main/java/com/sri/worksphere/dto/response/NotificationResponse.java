package com.sri.worksphere.dto.response;

import java.time.LocalDateTime;

public record NotificationResponse(

        Long id,
        String message,
        boolean read,
        LocalDateTime createdAt

) {
}