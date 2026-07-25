package com.fleetmanager.backend.assignment.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AssignmentDto(
        UUID id,
        UUID vehicleId,
        String vehicleName,
        UUID driverId,
        String driverName,
        LocalDate startDate,
        LocalDate endDate,
        String note
) {
}
