package com.fleetmanager.backend.user.dto;

import com.fleetmanager.backend.user.Role;
import jakarta.validation.constraints.Email;

public record UpdateUserRequest(
        String name,
        @Email(message = "Email invalide") String email,
        Role role,
        Boolean active,
        String password
) {
}
