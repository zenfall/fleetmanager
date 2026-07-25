package com.fleetmanager.backend.operation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GpsRechargeRequest(
        @NotNull UUID vehicleId,
        UUID driverId,
        @NotNull LocalDate date,
        @NotNull @DecimalMin("0") BigDecimal amount,
        Integer validityDays,
        LocalDate expiryDate,
        String provider
) {
}
