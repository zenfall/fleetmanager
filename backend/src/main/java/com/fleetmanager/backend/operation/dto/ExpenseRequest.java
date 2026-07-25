package com.fleetmanager.backend.operation.dto;

import com.fleetmanager.backend.operation.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ExpenseRequest(
        @NotNull UUID vehicleId,
        UUID driverId,
        @NotNull LocalDate date,
        @NotNull @DecimalMin("0") BigDecimal amount,
        @NotNull ExpenseCategory category,
        @NotBlank String description
) {
}
