package com.sri.worksphere.service;

import com.sri.worksphere.dto.request.LoginPayload;
import com.sri.worksphere.dto.request.RegisterPayload;
import com.sri.worksphere.dto.response.UserResponse;
import com.sri.worksphere.entity.Role;
import com.sri.worksphere.entity.User;
import com.sri.worksphere.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.sri.worksphere.dto.response.LoginResponse;
import com.sri.worksphere.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterPayload payload) {

        if (userRepository.findByEmail(payload.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        String hashedPassword =
                passwordEncoder.encode(payload.password());

        User user = new User(
                payload.name(),
                payload.email(),
                hashedPassword,
                Role.EMPLOYEE
        );

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public LoginResponse login(LoginPayload payload) {

        User user = userRepository.findByEmail(payload.email())
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password")
                );

        if (!passwordEncoder.matches(
                payload.password(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponse(token, userResponse);
    }
}