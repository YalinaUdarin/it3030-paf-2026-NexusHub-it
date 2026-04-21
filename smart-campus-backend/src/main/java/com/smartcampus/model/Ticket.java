package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private String resourceId;
    private String location;

    private String reportedBy;
    private String reportedByName;
    private String reportedByEmail;

    private String contactPhone;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String assignedTo;
    private String assignedToName;

    // Max 3 image attachments
    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>();

    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime resolvedAt;

    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum TicketCategory {
        ELECTRICAL, PLUMBING, IT_EQUIPMENT, HVAC, FURNITURE, SAFETY, OTHER
    }

    public enum TicketPriority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Comment {
        private String id;
        private String authorId;
        private String authorName;
        private String content;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
