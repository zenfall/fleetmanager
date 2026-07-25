package com.fleetmanager.backend.auth;

import com.fleetmanager.backend.auth.dto.AuthResponse;
import com.fleetmanager.backend.auth.dto.LoginRequest;
import com.fleetmanager.backend.auth.dto.RefreshRequest;
import com.fleetmanager.backend.user.dto.UserDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request);
    }

    @GetMapping("/me")
    public UserDto me(Authentication authentication) {
        return authService.getCurrentUser(authentication);
    }

    @PostMapping("/logout")
    public void logout() {
        // Stateless JWT : la deconnexion est geree cote client (suppression des tokens).
        // Un blacklist/redis pourrait etre ajoute ici pour une revocation serveur immediate.
    }
}
