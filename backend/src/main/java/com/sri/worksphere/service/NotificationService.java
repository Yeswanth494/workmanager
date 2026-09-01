package com.sri.worksphere.service;

import com.sri.worksphere.dto.response.NotificationResponse;
import com.sri.worksphere.entity.Notification;
import com.sri.worksphere.entity.User;
import com.sri.worksphere.exception.ResourceNotFoundException;
import com.sri.worksphere.repository.NotificationRepository;
import com.sri.worksphere.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET MY NOTIFICATIONS
    // =========================================================

    public List<NotificationResponse> getMyNotifications(
            Long userId) {

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET MY UNREAD NOTIFICATIONS
    // =========================================================

    public List<NotificationResponse> getMyUnreadNotifications(
            Long userId) {

        return notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET UNREAD COUNT
    // =========================================================

    public long getUnreadCount(Long userId) {

        return notificationRepository
                .countByUserIdAndReadFalse(userId);
    }

    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    public NotificationResponse markAsRead(
            Long userId,
            Long notificationId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser()
                .getId()
                .equals(userId)) {

            throw new IllegalArgumentException(
                    "You cannot modify another user's notification"
            );
        }

        notification.setRead(true);

        return toResponse(
                notificationRepository.save(notification)
        );
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    public NotificationResponse createNotification(
            Long userId,
            String message) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );

        Notification notification =
                new Notification(
                        message,
                        user
                );

        Notification saved =
                notificationRepository.save(notification);

        return toResponse(saved);
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private NotificationResponse toResponse(
            Notification notification) {

        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}