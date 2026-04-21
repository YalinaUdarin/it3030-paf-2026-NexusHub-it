package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.security.CustomUserDetailsService.UserPrincipal;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // POST /api/bookings
    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(booking, principal.getUser()));
    }

    // GET /api/bookings — admin sees all, user sees own
    @GetMapping
    public ResponseEntity<List<Booking>> getBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return ResponseEntity.ok(bookingService.getAllBookings(status, resourceId, null));
        }
        return ResponseEntity.ok(bookingService.getUserBookings(principal.getId()));
    }

    // GET /api/bookings/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // PATCH /api/bookings/{id}/approve — admin only
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> approveBooking(@PathVariable String id,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.approveBooking(id, principal.getId()));
    }

    // PATCH /api/bookings/{id}/reject — admin only
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> rejectBooking(@PathVariable String id,
                                                  @RequestBody Map<String, String> body,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, body.get("reason"), principal.getId()));
    }

    // PATCH /api/bookings/{id}/cancel
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable String id,
                                                  @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(bookingService.cancelBooking(id, principal.getId(), isAdmin));
    }
}
