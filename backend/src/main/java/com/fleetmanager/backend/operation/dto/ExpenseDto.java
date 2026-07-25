package com.fleetmanager.backend.operation.dto;

import com.fleetmanager.backend.operation.ExpenseCategory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseDto(UUID id, UUID vehicleId, String vehicleName, UUID driverId, String driverName,
                          LocalDate date, BigDecimal amount, ExpenseCategory category, String description,
                          String createdByName) {
}
