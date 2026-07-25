package com.fleetmanager.backend.driver.dto;

import com.fleetmanager.backend.driver.DriverStatus;
import jakarta.validation.constraints.NotBlank;

public record DriverRequest(
        @NotBlank(message = "Le nom est requis") String name,
        String phone,
        String licenseNumber,
        DriverStatus status,
        String note
) {
}
