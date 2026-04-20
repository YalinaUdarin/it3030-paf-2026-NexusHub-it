package com.smartcampus.service;

import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests - Member 4")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification testNotification;

    @BeforeEach
    void setUp() {
        testNotification = Notification.builder()
                .id("notif-001")
                .userId("user-001")
                .title("Booking Approved")
                .message("Your booking for Lab A201 has been approved.")
                .type(Notification.NotificationType.BOOKING_APPROVED)
                .referenceId("book-001")
                .referenceType("BOOKING")
                .read(false)
                .build();
    }

    @Test
    @DisplayName("Should create notification with correct fields")
    void createNotification_ValidData_ReturnsNotification() {
        when(notificationRepository.save(any())).thenReturn(testNotification);

        Notification result = notificationService.createNotification(
                "user-001", "Booking Approved", "Your booking has been approved.",
                Notification.NotificationType.BOOKING_APPROVED, "book-001", "BOOKING");

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo("user-001");
        assertThat(result.getType()).isEqualTo(Notification.NotificationType.BOOKING_APPROVED);
        verify(notificationRepository).save(any());
    }

    @Test
    @DisplayName("Should return all notifications for user ordered by date")
    void getUserNotifications_ValidUser_ReturnsList() {
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user-001"))
                .thenReturn(List.of(testNotification));

        List<Notification> result = notificationService.getUserNotifications("user-001");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo("user-001");
    }

    @Test
    @DisplayName("Should return correct unread count")
    void getUnreadCount_ReturnsCorrectCount() {
        when(notificationRepository.countByUserIdAndRead("user-001", false)).thenReturn(3L);

        long count = notificationService.getUnreadCount("user-001");

        assertThat(count).isEqualTo(3L);
    }

    @Test
    @DisplayName("Should mark notification as read for owner")
    void markAsRead_ByOwner_SetsReadTrue() {
        when(notificationRepository.findById("notif-001")).thenReturn(Optional.of(testNotification));
        when(notificationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markAsRead("notif-001", "user-001");

        assertThat(result.isRead()).isTrue();
        verify(notificationRepository).save(any());
    }

    @Test
    @DisplayName("Should throw AccessDeniedException when marking other user's notification")
    void markAsRead_WrongUser_ThrowsException() {
        when(notificationRepository.findById("notif-001")).thenReturn(Optional.of(testNotification));

        assertThatThrownBy(() -> notificationService.markAsRead("notif-001", "other-user"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException for unknown notification")
    void markAsRead_NotFound_ThrowsException() {
        when(notificationRepository.findById("invalid")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead("invalid", "user-001"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should mark all unread notifications as read for user")
    void markAllAsRead_ValidUser_MarksAllRead() {
        Notification n2 = Notification.builder().id("notif-002").userId("user-001").read(false).build();
        when(notificationRepository.findByUserIdAndRead("user-001", false))
                .thenReturn(List.of(testNotification, n2));
        when(notificationRepository.saveAll(any())).thenReturn(List.of());

        assertThatCode(() -> notificationService.markAllAsRead("user-001"))
                .doesNotThrowAnyException();

        verify(notificationRepository).saveAll(argThat(list -> {
            List<Notification> notifications = (List<Notification>) list;
            return notifications.stream().allMatch(Notification::isRead);
        }));
    }

    @Test
    @DisplayName("Should send booking approved notification with correct message")
    void notifyBookingApproved_SendsCorrectNotification() {
        when(notificationRepository.save(any())).thenReturn(testNotification);

        notificationService.notifyBookingApproved("user-001", "book-001", "Lab A201");

        verify(notificationRepository).save(argThat(n ->
                n.getType() == Notification.NotificationType.BOOKING_APPROVED &&
                n.getUserId().equals("user-001") &&
                n.getMessage().contains("Lab A201")
        ));
    }

    @Test
    @DisplayName("Should send booking rejected notification with reason")
    void notifyBookingRejected_SendsCorrectNotification() {
        when(notificationRepository.save(any())).thenReturn(testNotification);

        notificationService.notifyBookingRejected("user-001", "book-001", "Lab A201", "Under maintenance");

        verify(notificationRepository).save(argThat(n ->
                n.getType() == Notification.NotificationType.BOOKING_REJECTED &&
                n.getMessage().contains("Under maintenance")
        ));
    }

    @Test
    @DisplayName("Should delete notification owned by user")
    void deleteNotification_ByOwner_DeletesSuccessfully() {
        when(notificationRepository.findById("notif-001")).thenReturn(Optional.of(testNotification));
        doNothing().when(notificationRepository).delete(any());

        assertThatCode(() -> notificationService.deleteNotification("notif-001", "user-001"))
                .doesNotThrowAnyException();

        verify(notificationRepository).delete(testNotification);
    }
}
