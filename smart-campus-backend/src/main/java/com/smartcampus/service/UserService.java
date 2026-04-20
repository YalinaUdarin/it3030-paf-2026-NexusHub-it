package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRoles(String userId, Set<User.Role> roles) {
        User user = getUserById(userId);
        user.setRoles(roles);
        log.info("Updated roles for user {}: {}", userId, roles);
        return userRepository.save(user);
    }

    public User updateProfile(String userId, String name, String picture) {
        User user = getUserById(userId);
        if (name != null && !name.isBlank()) user.setName(name);
        if (picture != null && !picture.isBlank()) user.setPicture(picture);
        return userRepository.save(user);
    }

    public void toggleUserEnabled(String userId, boolean enabled) {
        User user = getUserById(userId);
        user.setEnabled(enabled);
        userRepository.save(user);
        log.info("User {} enabled status set to {}", userId, enabled);
    }
}
