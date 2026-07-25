package com.fleetmanager.backend.user.dto;

import com.fleetmanager.backend.user.Role;

import java.time.Instant;
import java.util.UUID;

public record UserDto(
        UUID id,
        String name,
        String email,
        Role role,
        boolean active,
        Instant createdAt
) {
}
