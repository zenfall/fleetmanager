package com.fleetmanager.backend.operation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record OilChangeDto(UUID id, UUID vehicleId, String vehicleName, UUID driverId, String driverName,
                            LocalDate date, Integer mileage, BigDecimal cost, Integer nextChangeDays,
                            LocalDate nextChangeDate, String note, String createdByName) {
}
