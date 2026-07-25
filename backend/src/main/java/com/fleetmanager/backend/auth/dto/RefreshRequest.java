package com.fleetmanager.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "Le refresh token est requis") String refreshToken
) {
}
