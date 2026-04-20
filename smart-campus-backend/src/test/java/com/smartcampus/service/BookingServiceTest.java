package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BookingService Unit Tests")
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ResourceRepository resourceRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Resource testResource;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id("user-001").name("John Doe").email("john@sliit.lk")
                .roles(Set.of(User.Role.USER)).enabled(true).build();

        testResource = Resource.builder()
                .id("res-001").name("Meeting Room B")
                .type(Resource.ResourceType.MEETING_ROOM)
                .capacity(10).location("Block B")
                .status(Resource.ResourceStatus.ACTIVE).build();

        testBooking = Booking.builder()
                .id("book-001").resourceId("res-001").resourceName("Meeting Room B")
                .userId("user-001").bookingDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(10, 0))
                .purpose("Team meeting").expectedAttendees(5)
                .status(Booking.BookingStatus.PENDING).build();
    }

    @Test
    @DisplayName("Should create booking when no conflicts exist")
    void createBooking_NoConflict_ReturnsSavedBooking() {
        when(resourceRepository.findById("res-001")).thenReturn(Optional.of(testResource));
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any())).thenReturn(List.of());
        when(bookingRepository.save(any())).thenReturn(testBooking);

        Booking result = bookingService.createBooking(testBooking, testUser);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(Booking.BookingStatus.PENDING);
        verify(bookingRepository).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when time conflict exists")
    void createBooking_WithConflict_ThrowsException() {
        when(resourceRepository.findById("res-001")).thenReturn(Optional.of(testResource));
        when(bookingRepository.findConflictingBookings(any(), any(), any(), any()))
                .thenReturn(List.of(testBooking));

        assertThatThrownBy(() -> bookingService.createBooking(testBooking, testUser))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already booked");
    }

    @Test
    @DisplayName("Should throw BadRequestException for OUT_OF_SERVICE resource")
    void createBooking_ResourceNotActive_ThrowsException() {
        testResource.setStatus(Resource.ResourceStatus.OUT_OF_SERVICE);
        when(resourceRepository.findById("res-001")).thenReturn(Optional.of(testResource));

        assertThatThrownBy(() -> bookingService.createBooking(testBooking, testUser))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("not available");
    }

    @Test
    @DisplayName("Should approve PENDING booking")
    void approveBooking_PendingBooking_SetsApproved() {
        when(bookingRepository.findById("book-001")).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(notificationService).notifyBookingApproved(any(), any(), any());

        Booking result = bookingService.approveBooking("book-001", "admin-001");

        assertThat(result.getStatus()).isEqualTo(Booking.BookingStatus.APPROVED);
        assertThat(result.getApprovedBy()).isEqualTo("admin-001");
        verify(notificationService).notifyBookingApproved(any(), any(), any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when approving non-PENDING booking")
    void approveBooking_NonPending_ThrowsException() {
        testBooking.setStatus(Booking.BookingStatus.APPROVED);
        when(bookingRepository.findById("book-001")).thenReturn(Optional.of(testBooking));

        assertThatThrownBy(() -> bookingService.approveBooking("book-001", "admin-001"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    @DisplayName("Should reject PENDING booking with reason")
    void rejectBooking_WithReason_SetsRejected() {
        when(bookingRepository.findById("book-001")).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(notificationService).notifyBookingRejected(any(), any(), any(), any());

        Booking result = bookingService.rejectBooking("book-001", "Resource under maintenance", "admin-001");

        assertThat(result.getStatus()).isEqualTo(Booking.BookingStatus.REJECTED);
        assertThat(result.getRejectionReason()).isEqualTo("Resource under maintenance");
    }

    @Test
    @DisplayName("Should throw BadRequestException when rejecting without reason")
    void rejectBooking_NoReason_ThrowsException() {
        when(bookingRepository.findById("book-001")).thenReturn(Optional.of(testBooking));

        assertThatThrownBy(() -> bookingService.rejectBooking("book-001", "", "admin-001"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("reason");
    }

    @Test
    @DisplayName("Should cancel APPROVED booking by owner")
    void cancelBooking_ByOwner_SetsCancelled() {
        testBooking.setStatus(Booking.BookingStatus.APPROVED);
        when(bookingRepository.findById("book-001")).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(notificationService).notifyBookingCancelled(any(), any(), any());

        Booking result = bookingService.cancelBooking("book-001", "user-001", false);

        assertThat(result.getStatus()).isEqualTo(Booking.BookingStatus.CANCELLED);
    }
}
