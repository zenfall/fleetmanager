package com.fleetmanager.backend.user.dto;

import com.fleetmanager.backend.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank(message = "Le nom est requis") String name,
        @NotBlank(message = "L\u0027email est requis") @Email(message = "Email invalide") String email,
        @NotBlank(message = "Le mot de passe est requis") @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caracteres") String password,
        @NotNull(message = "Le role est requis") Role role
) {
}
