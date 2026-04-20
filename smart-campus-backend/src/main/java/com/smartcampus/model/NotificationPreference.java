package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification_preferences")
public class NotificationPreference {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Builder.Default private boolean bookingApproved = true;
    @Builder.Default private boolean bookingRejected = true;
    @Builder.Default private boolean bookingCancelled = true;
    @Builder.Default private boolean ticketStatusChanged = true;
    @Builder.Default private boolean ticketAssigned = true;
    @Builder.Default private boolean ticketCommentAdded = true;
    @Builder.Default private boolean ticketResolved = true;
}
