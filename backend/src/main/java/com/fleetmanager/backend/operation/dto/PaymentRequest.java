package com.fleetmanager.backend.operation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PaymentRequest(
        @NotNull UUID vehicleId,
        UUID driverId,
        @NotNull @DecimalMin(value = "0", inclusive = true) BigDecimal amount,
        @NotNull LocalDate date,
        String note
) {
}
