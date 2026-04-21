package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByUserIdAndStatus(String userId, Booking.BookingStatus status);

    // Conflict detection query
    @Query("{ 'resourceId': ?0, 'bookingDate': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "$or: [ { 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } } ] }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date,
                                          LocalTime startTime, LocalTime endTime);

    List<Booking> findByResourceIdAndBookingDateAndStatusIn(
            String resourceId, LocalDate bookingDate, List<Booking.BookingStatus> statuses);
}
