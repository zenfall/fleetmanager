package com.fleetmanager.backend.operation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record OilChangeRequest(
        @NotNull UUID vehicleId,
        UUID driverId,
        @NotNull LocalDate date,
        @NotNull @Min(0) Integer mileage,
        @NotNull @DecimalMin("0") BigDecimal cost,
        Integer nextChangeDays,
        LocalDate nextChangeDate,
        String note
) {
}
