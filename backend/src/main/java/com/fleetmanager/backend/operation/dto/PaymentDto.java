package com.fleetmanager.backend.operation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentDto(UUID id, UUID vehicleId, String vehicleName, UUID driverId, String driverName,
                          BigDecimal amount, LocalDate date, String note, String createdByName) {
}
