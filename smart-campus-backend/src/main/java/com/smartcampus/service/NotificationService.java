package com.smartcampus.service;

import com.smartcampus.model.Notification;
import com.smartcampus.model.NotificationPreference;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    // ── Preferences ───────────────────────────────────────────

    public NotificationPreference getPreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference defaults = NotificationPreference.builder()
                            .userId(userId).build();
                    return preferenceRepository.save(defaults);
                });
    }

    public NotificationPreference updatePreferences(String userId, NotificationPreference updated) {
        NotificationPreference prefs = getPreferences(userId);
        prefs.setBookingApproved(updated.isBookingApproved());
        prefs.setBookingRejected(updated.isBookingRejected());
        prefs.setBookingCancelled(updated.isBookingCancelled());
        prefs.setTicketStatusChanged(updated.isTicketStatusChanged());
        prefs.setTicketAssigned(updated.isTicketAssigned());
        prefs.setTicketCommentAdded(updated.isTicketCommentAdded());
        prefs.setTicketResolved(updated.isTicketResolved());
        log.info("Updated notification preferences for user {}", userId);
        return preferenceRepository.save(prefs);
    }

    private boolean isEnabled(String userId, Notification.NotificationType type) {
        NotificationPreference prefs = getPreferences(userId);
        return switch (type) {
            case BOOKING_APPROVED -> prefs.isBookingApproved();
            case BOOKING_REJECTED -> prefs.isBookingRejected();
            case BOOKING_CANCELLED -> prefs.isBookingCancelled();
            case TICKET_STATUS_CHANGED -> prefs.isTicketStatusChanged();
            case TICKET_ASSIGNED -> prefs.isTicketAssigned();
            case TICKET_COMMENT_ADDED -> prefs.isTicketCommentAdded();
            case TICKET_RESOLVED -> prefs.isTicketResolved();
        };
    }

    // ── Core notification methods ─────────────────────────────

    public Notification createNotification(String userId, String title, String message,
                                            Notification.NotificationType type,
                                            String referenceId, String referenceType) {
        // Check preferences before creating
        if (!isEnabled(userId, type)) {
            log.info("Notification type {} is disabled for user {}, skipping", type, userId);
            return null;
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .read(false)
                .build();
        log.info("Creating notification for user {}: {}", userId, title);
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndRead(userId, false);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    public Notification markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not your notification");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new AccessDeniedException("Not your notification");
        }
        notificationRepository.delete(notification);
    }

    // ── Helper methods ────────────────────────────────────────

    public void notifyBookingApproved(String userId, String bookingId, String resourceName) {
        createNotification(userId, "Booking Approved",
                "Your booking for " + resourceName + " has been approved.",
                Notification.NotificationType.BOOKING_APPROVED, bookingId, "BOOKING");
    }

    public void notifyBookingRejected(String userId, String bookingId, String resourceName, String reason) {
        createNotification(userId, "Booking Rejected",
                "Your booking for " + resourceName + " was rejected. Reason: " + reason,
                Notification.NotificationType.BOOKING_REJECTED, bookingId, "BOOKING");
    }

    public void notifyBookingCancelled(String userId, String bookingId, String resourceName) {
        createNotification(userId, "Booking Cancelled",
                "Your booking for " + resourceName + " has been cancelled.",
                Notification.NotificationType.BOOKING_CANCELLED, bookingId, "BOOKING");
    }

    public void notifyTicketStatusChanged(String userId, String ticketId, String ticketTitle, String newStatus) {
        createNotification(userId, "Ticket Status Updated",
                "Your ticket '" + ticketTitle + "' status changed to " + newStatus,
                Notification.NotificationType.TICKET_STATUS_CHANGED, ticketId, "TICKET");
    }

    public void notifyTicketAssigned(String userId, String ticketId, String ticketTitle) {
        createNotification(userId, "Ticket Assigned to You",
                "You have been assigned to ticket: " + ticketTitle,
                Notification.NotificationType.TICKET_ASSIGNED, ticketId, "TICKET");
    }

    public void notifyTicketComment(String userId, String ticketId, String ticketTitle, String commenterName) {
        createNotification(userId, "New Comment on Ticket",
                commenterName + " commented on your ticket: " + ticketTitle,
                Notification.NotificationType.TICKET_COMMENT_ADDED, ticketId, "TICKET");
    }
}
