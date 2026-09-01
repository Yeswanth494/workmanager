package com.sri.worksphere.controller;

import com.sri.worksphere.dto.response.UserSummaryResponse;
import com.sri.worksphere.entity.Role;
import com.sri.worksphere.entity.User;
import com.sri.worksphere.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(
            UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ============================================
    // GET ALL USERS
    // ============================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryResponse>>
    getAllUsers() {

        List<UserSummaryResponse> users =
                userRepository.findAll()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(users);
    }

    // ============================================
    // GET ALL MANAGERS
    // ============================================

    @GetMapping("/managers")
    @PreAuthorize(
            "hasAnyRole('ADMIN', 'MANAGER')"
    )
    public ResponseEntity<List<UserSummaryResponse>>
    getManagers() {

        List<UserSummaryResponse> managers =
                userRepository
                        .findByRole(Role.MANAGER)
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(managers);
    }

    // ============================================
    // USER → SAFE RESPONSE
    // ============================================

    private UserSummaryResponse toResponse(
            User user) {

        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}