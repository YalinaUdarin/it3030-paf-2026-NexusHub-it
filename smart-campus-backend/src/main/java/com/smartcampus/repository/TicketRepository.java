package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByReportedBy(String userId);
    List<Ticket> findByAssignedTo(String userId);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
    List<Ticket> findByPriority(Ticket.TicketPriority priority);
    List<Ticket> findByResourceId(String resourceId);
    List<Ticket> findByStatusAndPriority(Ticket.TicketStatus status, Ticket.TicketPriority priority);
}
