package com.fleetmanager.backend.assignment.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record AssignDriverRequest(
        @NotNull(message = "Le vehicule est requis") UUID vehicleId,
        @NotNull(message = "Le chauffeur est requis") UUID driverId,
        LocalDate startDate,
        String note
) {
}
