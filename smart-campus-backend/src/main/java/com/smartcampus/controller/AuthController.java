package com.smartcampus.controller;

import com.smartcampus.dto.AuthDto;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.CustomUserDetailsService.UserPrincipal;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    // POST /api/auth/register — email/password registration
    @PostMapping("/api/auth/register")
    public ResponseEntity<AuthDto.AuthResponse> register(
            @Valid @RequestBody AuthDto.RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of(User.Role.USER))
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        String rolesStr = saved.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));
        String token = tokenProvider.generateToken(saved.getId(), saved.getEmail(), rolesStr);

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthDto.AuthResponse(token, saved));
    }

    // POST /api/auth/login — email/password login
    @PostMapping("/api/auth/login")
    public ResponseEntity<AuthDto.AuthResponse> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new BadRequestException("Account is disabled. Please contact admin.");
        }

        if (user.getPassword() == null) {
            throw new BadRequestException("This account uses Google Sign-In. Please use the Google login option.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String rolesStr = user.getRoles().stream().map(Enum::name).collect(Collectors.joining(","));
        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), rolesStr);

        return ResponseEntity.ok(new AuthDto.AuthResponse(token, user));
    }

    // GET /api/auth/me — get current user profile
    @GetMapping("/api/auth/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        User user = principal.getUser();
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName(),
                "picture", user.getPicture() != null ? user.getPicture() : "",
                "roles", user.getRoles().stream().map(Enum::name).collect(Collectors.toList())
        ));
    }

    // GET /api/admin/users
    @GetMapping("/api/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // PATCH /api/admin/users/{id}/roles
    @PatchMapping("/api/admin/users/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateRoles(@PathVariable String id,
                                             @RequestBody Map<String, List<String>> body) {
        Set<User.Role> roles = body.get("roles").stream()
                .map(User.Role::valueOf).collect(Collectors.toSet());
        return ResponseEntity.ok(userService.updateUserRoles(id, roles));
    }

    // PATCH /api/admin/users/{id}/toggle
    @PatchMapping("/api/admin/users/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleUser(@PathVariable String id,
                                            @RequestBody Map<String, Boolean> body) {
        userService.toggleUserEnabled(id, body.get("enabled"));
        return ResponseEntity.noContent().build();
    }

    // GET /api/admin/stats
    @GetMapping("/api/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of("totalUsers", userService.getAllUsers().size()));
    }
}
