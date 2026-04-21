package com.smartcampus.service;

import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public Ticket createTicket(Ticket ticket, List<MultipartFile> attachments, User currentUser) {
        if (attachments != null && attachments.size() > 3) {
            throw new BadRequestException("Maximum 3 attachments allowed");
        }

        ticket.setReportedBy(currentUser.getId());
        ticket.setReportedByName(currentUser.getName());
        ticket.setReportedByEmail(currentUser.getEmail());
        ticket.setStatus(Ticket.TicketStatus.OPEN);
        ticket.setComments(new ArrayList<>());

        List<String> attachmentUrls = new ArrayList<>();
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                String url = fileStorageService.storeFile(file);
                attachmentUrls.add(url);
            }
        }
        ticket.setAttachmentUrls(attachmentUrls);

        log.info("Creating ticket '{}' by user {}", ticket.getTitle(), currentUser.getEmail());
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets(String status, String priority, String assignedTo) {
        if (status != null && priority != null) {
            return ticketRepository.findByStatusAndPriority(
                    Ticket.TicketStatus.valueOf(status),
                    Ticket.TicketPriority.valueOf(priority));
        }
        if (status != null) return ticketRepository.findByStatus(Ticket.TicketStatus.valueOf(status));
        if (priority != null) return ticketRepository.findByPriority(Ticket.TicketPriority.valueOf(priority));
        if (assignedTo != null) return ticketRepository.findByAssignedTo(assignedTo);
        return ticketRepository.findAll();
    }

    public List<Ticket> getUserTickets(String userId) {
        return ticketRepository.findByReportedBy(userId);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    public Ticket updateTicketStatus(String ticketId, Ticket.TicketStatus newStatus,
                                      String resolutionNotes, String rejectionReason,
                                      String updatedByUserId) {
        Ticket ticket = getTicketById(ticketId);

        // Validate status transition
        validateStatusTransition(ticket.getStatus(), newStatus);

        ticket.setStatus(newStatus);

        if (newStatus == Ticket.TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(resolutionNotes);
            ticket.setResolvedAt(LocalDateTime.now());
        }
        if (newStatus == Ticket.TicketStatus.REJECTED) {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new BadRequestException("Rejection reason is required");
            }
            ticket.setRejectionReason(rejectionReason);
        }

        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketStatusChanged(
                ticket.getReportedBy(), ticketId, ticket.getTitle(), newStatus.name());
        return saved;
    }

    public Ticket assignTicket(String ticketId, String technicianId) {
        Ticket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + technicianId));

        ticket.setAssignedTo(technicianId);
        ticket.setAssignedToName(technician.getName());
        if (ticket.getStatus() == Ticket.TicketStatus.OPEN) {
            ticket.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        }

        Ticket saved = ticketRepository.save(ticket);
        notificationService.notifyTicketAssigned(technicianId, ticketId, ticket.getTitle());
        return saved;
    }

    public Ticket addComment(String ticketId, String content, User currentUser) {
        Ticket ticket = getTicketById(ticketId);

        Ticket.Comment comment = Ticket.Comment.builder()
                .id(UUID.randomUUID().toString())
                .authorId(currentUser.getId())
                .authorName(currentUser.getName())
                .content(content)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ticket.getComments().add(comment);
        Ticket saved = ticketRepository.save(ticket);

        // Notify ticket owner if commenter is not the owner
        if (!currentUser.getId().equals(ticket.getReportedBy())) {
            notificationService.notifyTicketComment(
                    ticket.getReportedBy(), ticketId, ticket.getTitle(), currentUser.getName());
        }
        return saved;
    }

    public Ticket editComment(String ticketId, String commentId, String content, User currentUser) {
        Ticket ticket = getTicketById(ticketId);

        Ticket.Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getAuthorId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only edit your own comments");
        }

        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }

    public Ticket deleteComment(String ticketId, String commentId, User currentUser, boolean isAdmin) {
        Ticket ticket = getTicketById(ticketId);

        Ticket.Comment comment = ticket.getComments().stream()
                .filter(c -> c.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!isAdmin && !comment.getAuthorId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        ticket.getComments().removeIf(c -> c.getId().equals(commentId));
        return ticketRepository.save(ticket);
    }

    private void validateStatusTransition(Ticket.TicketStatus current, Ticket.TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == Ticket.TicketStatus.IN_PROGRESS || next == Ticket.TicketStatus.REJECTED;
            case IN_PROGRESS -> next == Ticket.TicketStatus.RESOLVED || next == Ticket.TicketStatus.REJECTED;
            case RESOLVED -> next == Ticket.TicketStatus.CLOSED;
            default -> false;
        };
        if (!valid) {
            throw new BadRequestException("Invalid status transition: " + current + " -> " + next);
        }
    }
}
