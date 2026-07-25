package com.fleetmanager.backend.operation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GpsRechargeDto(UUID id, UUID vehicleId, String vehicleName, UUID driverId, String driverName,
                              LocalDate date, BigDecimal amount, Integer validityDays, LocalDate expiryDate,
                              String provider, String createdByName) {
}
