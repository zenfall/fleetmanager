package com.fleetmanager.backend.vehicle.dto;

import com.fleetmanager.backend.vehicle.VehicleStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record VehicleDto(
        UUID id,
        String name,
        String plate,
        UUID currentDriverId,
        String currentDriverName,
        VehicleStatus status,
        LocalDate gpsExpiryDate,
        Instant createdAt
) {
}
