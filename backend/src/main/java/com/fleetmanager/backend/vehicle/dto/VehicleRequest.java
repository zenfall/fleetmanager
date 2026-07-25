package com.fleetmanager.backend.vehicle.dto;

import com.fleetmanager.backend.vehicle.VehicleStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record VehicleRequest(
        @NotBlank(message = "Le nom est requis") String name,
        @NotBlank(message = "L\u0027immatriculation est requise") String plate,
        VehicleStatus status,
        LocalDate gpsExpiryDate
) {
}
