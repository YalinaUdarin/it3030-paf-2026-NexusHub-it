package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.AccessDeniedException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public Booking createBooking(Booking booking, User currentUser) {
        // Validate resource exists and is active
        Resource resource = resourceRepository.findById(booking.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + booking.getResourceId()));

        if (resource.getStatus() != Resource.ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking: " + resource.getStatus());
        }

        // Validate time range
        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                booking.getResourceId(),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime());

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This resource is already booked for the selected time slot");
        }

        booking.setUserId(currentUser.getId());
        booking.setUserName(currentUser.getName());
        booking.setUserEmail(currentUser.getEmail());
        booking.setResourceName(resource.getName());
        booking.setStatus(Booking.BookingStatus.PENDING);

        log.info("Creating booking for resource {} by user {}", resource.getName(), currentUser.getEmail());
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings(String status, String resourceId, String userId) {
        if (status != null && resourceId != null) {
            return bookingRepository.findByResourceId(resourceId).stream()
                    .filter(b -> b.getStatus().name().equals(status))
                    .toList();
        }
        if (status != null) return bookingRepository.findByStatus(Booking.BookingStatus.valueOf(status));
        if (resourceId != null) return bookingRepository.findByResourceId(resourceId);
        if (userId != null) return bookingRepository.findByUserId(userId);
        return bookingRepository.findAll();
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    public Booking approveBooking(String bookingId, String adminId) {
        Booking booking = getBookingById(bookingId);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedBy(adminId);
        booking.setApprovedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingApproved(booking.getUserId(), bookingId, booking.getResourceName());
        return saved;
    }

    public Booking rejectBooking(String bookingId, String reason, String adminId) {
        Booking booking = getBookingById(bookingId);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }
        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setApprovedBy(adminId);
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingRejected(booking.getUserId(), bookingId, booking.getResourceName(), reason);
        return saved;
    }

    public Booking cancelBooking(String bookingId, String userId, boolean isAdmin) {
        Booking booking = getBookingById(bookingId);

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }
        if (booking.getStatus() == Booking.BookingStatus.REJECTED ||
            booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking cannot be cancelled in its current state");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        notificationService.notifyBookingCancelled(booking.getUserId(), bookingId, booking.getResourceName());
        return saved;
    }
}
