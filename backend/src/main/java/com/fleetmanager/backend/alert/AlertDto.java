package com.fleetmanager.backend.alert;

import java.time.LocalDate;
import java.util.UUID;

public record AlertDto(
        String id,
        UUID vehicleId,
        String vehicleName,
        AlertType type,
        String message,
        Severity severity,
        LocalDate date
) {
}
