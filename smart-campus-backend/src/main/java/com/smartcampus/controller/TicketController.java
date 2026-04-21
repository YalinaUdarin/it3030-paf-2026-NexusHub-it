package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.security.CustomUserDetailsService.UserPrincipal;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // POST /api/tickets — multipart for attachments
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> createTicket(
            @RequestPart("ticket") Ticket ticket,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(ticket, attachments, principal.getUser()));
    }

    // GET /api/tickets
    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assignedTo,
            @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTech = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TECHNICIAN"));
        if (isAdmin || isTech) {
            return ResponseEntity.ok(ticketService.getAllTickets(status, priority, assignedTo));
        }
        return ResponseEntity.ok(ticketService.getUserTickets(principal.getId()));
    }

    // GET /api/tickets/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicket(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // PATCH /api/tickets/{id}/status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<Ticket> updateStatus(@PathVariable String id,
                                                @RequestBody Map<String, String> body,
                                                @AuthenticationPrincipal UserPrincipal principal) {
        Ticket.TicketStatus status = Ticket.TicketStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ticketService.updateTicketStatus(
                id, status, body.get("resolutionNotes"), body.get("rejectionReason"), principal.getId()));
    }

    // PATCH /api/tickets/{id}/assign
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicket(@PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.assignTicket(id, body.get("technicianId")));
    }

    // POST /api/tickets/{id}/comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> addComment(@PathVariable String id,
                                              @RequestBody Map<String, String> body,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.addComment(id, body.get("content"), principal.getUser()));
    }

    // PUT /api/tickets/{ticketId}/comments/{commentId}
    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Ticket> editComment(@PathVariable String ticketId,
                                               @PathVariable String commentId,
                                               @RequestBody Map<String, String> body,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ticketService.editComment(ticketId, commentId, body.get("content"), principal.getUser()));
    }

    // DELETE /api/tickets/{ticketId}/comments/{commentId}
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Ticket> deleteComment(@PathVariable String ticketId,
                                                 @PathVariable String commentId,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(ticketService.deleteComment(ticketId, commentId, principal.getUser(), isAdmin));
    }
}
