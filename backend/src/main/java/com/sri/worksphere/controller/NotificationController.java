package com.sri.worksphere.controller;

import com.sri.worksphere.dto.response.NotificationResponse;
import com.sri.worksphere.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                notificationService.getMyNotifications(userId)
        );
    }

    // =========================================================
    // GET MY UNREAD NOTIFICATIONS
    // =========================================================

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationResponse>> getMyUnreadNotifications(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                notificationService.getMyUnreadNotifications(userId)
        );
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount(
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                notificationService.getUnreadCount(userId)
        );
    }

    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId =
                Long.valueOf(authentication.getName());

        return ResponseEntity.ok(
                notificationService.markAsRead(
                        userId,
                        id
                )
        );
    }
}