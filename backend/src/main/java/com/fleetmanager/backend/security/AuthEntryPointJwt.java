package com.fleetmanager.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetmanager.backend.common.exception.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.time.Instant;

/** Point d\u0027entree appele quand une requete non authentifiee touche une ressource protegee. */
@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws java.io.IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponse body = new ErrorResponse(
                Instant.now(), HttpStatus.UNAUTHORIZED.value(), "Unauthorized",
                "Authentification requise", request.getRequestURI(), null
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
