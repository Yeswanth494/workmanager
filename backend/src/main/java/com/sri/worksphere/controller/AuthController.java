package com.sri.worksphere.controller;

import com.sri.worksphere.dto.request.LoginPayload;
import com.sri.worksphere.dto.request.RegisterPayload;
import com.sri.worksphere.dto.response.LoginResponse;
import com.sri.worksphere.dto.response.UserResponse;
import com.sri.worksphere.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @RequestBody RegisterPayload payload) {

        UserResponse response = authService.register(payload);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginPayload payload) {

        return ResponseEntity.ok(authService.login(payload));
    }
}