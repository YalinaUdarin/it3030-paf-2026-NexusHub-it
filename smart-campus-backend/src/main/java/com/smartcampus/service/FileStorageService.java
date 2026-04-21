package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    public FileStorageService() {
        this.uploadDir = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new BadRequestException("Only image files are allowed (JPEG, PNG, GIF, WEBP)");
        }

        // Validate file size (5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 5MB");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "file");
        String extension = "";
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex);
        }

        String fileName = UUID.randomUUID() + extension;

        try {
            Path targetLocation = this.uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file: {}", fileName);
            return "/api/files/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }

    public Path loadFile(String fileName) {
        return uploadDir.resolve(fileName).normalize();
    }

    public void deleteFile(String fileUrl) {
        String fileName = fileUrl.replace("/api/files/", "");
        try {
            Path filePath = uploadDir.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", fileName);
        }
    }
}
