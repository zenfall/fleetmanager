package com.fleetmanager.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "L\u0027email est requis") String email,
        @NotBlank(message = "Le mot de passe est requis") String password
) {
}
