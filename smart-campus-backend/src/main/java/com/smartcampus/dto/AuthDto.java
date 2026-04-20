package com.smartcampus.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @Email(message = "Valid email is required")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @Email(message = "Valid email is required")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String id;
        private String name;
        private String email;
        private String picture;
        private java.util.List<String> roles;

        public AuthResponse(String token, com.smartcampus.model.User user) {
            this.token = token;
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.picture = user.getPicture();
            this.roles = user.getRoles().stream()
                    .map(Enum::name)
                    .collect(java.util.stream.Collectors.toList());
        }
    }
}
