package com.fleetmanager.backend.driver.dto;

import com.fleetmanager.backend.driver.DriverStatus;

import java.time.Instant;
import java.util.UUID;

public record DriverDto(
        UUID id,
        String name,
        String phone,
        String licenseNumber,
        DriverStatus status,
        String note,
        Instant createdAt
) {
}
