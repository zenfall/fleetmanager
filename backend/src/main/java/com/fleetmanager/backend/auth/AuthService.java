package com.fleetmanager.backend.auth;

import com.fleetmanager.backend.auth.dto.AuthResponse;
import com.fleetmanager.backend.auth.dto.LoginRequest;
import com.fleetmanager.backend.auth.dto.RefreshRequest;
import com.fleetmanager.backend.security.JwtService;
import com.fleetmanager.backend.security.UserPrincipal;
import com.fleetmanager.backend.user.User;
import com.fleetmanager.backend.user.UserRepository;
import com.fleetmanager.backend.user.dto.UserDto;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Identifiants invalides");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return buildAuthResponse(principal);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String token = request.refreshToken();
        String type;
        String email;
        try {
            type = jwtService.extractTokenType(token);
            email = jwtService.extractEmail(token);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Refresh token invalide");
        }

        if (!"refresh".equals(type) || !jwtService.isTokenValid(token, email)) {
            throw new BadCredentialsException("Refresh token invalide ou expire");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Utilisateur introuvable"));
        if (!user.isActive()) {
            throw new BadCredentialsException("Compte desactive");
        }

        return buildAuthResponse(new UserPrincipal(user));
    }

    public UserDto getCurrentUser(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadCredentialsException("Utilisateur introuvable"));
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(), user.getCreatedAt());
    }

    private AuthResponse buildAuthResponse(UserPrincipal principal) {
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);
        long expiresAt = jwtService.extractExpiration(accessToken).getTime();
        UserDto userDto = new UserDto(principal.getId(), principal.getName(), principal.getEmail(),
                com.fleetmanager.backend.user.Role.valueOf(principal.getRole()), principal.isActive(), null);
        return new AuthResponse(accessToken, refreshToken, expiresAt, userDto);
    }
}
