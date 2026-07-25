package com.fleetmanager.backend.auth.dto;

import com.fleetmanager.backend.user.dto.UserDto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        long expiresAt,
        UserDto user
) {
}
