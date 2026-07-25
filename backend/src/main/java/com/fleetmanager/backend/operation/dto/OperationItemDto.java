package com.fleetmanager.backend.operation.dto;

import com.fleetmanager.backend.operation.ExpenseCategory;
import com.fleetmanager.backend.operation.OperationType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/** Element unifie pour la vue 360 (Operations) - projection en lecture seule. */
public record OperationItemDto(
        UUID id,
        OperationType type,
        LocalDate date,
        UUID vehicleId,
        String vehicleName,
        UUID driverId,
        String driverName,
        BigDecimal amount,
        boolean isIncome,
        String description,
        ExpenseCategory category,
        String createdByName
) {
}
