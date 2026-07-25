package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.operation.dto.GpsRechargeDto;
import com.fleetmanager.backend.operation.dto.GpsRechargeRequest;
import com.fleetmanager.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gps-recharges")
@RequiredArgsConstructor
public class GpsRechargeController {

    private final GpsRechargeService gpsRechargeService;

    @GetMapping
    public List<GpsRechargeDto> findAll(@AuthenticationPrincipal UserPrincipal principal) {
        return gpsRechargeService.findAll(principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public GpsRechargeDto create(@Valid @RequestBody GpsRechargeRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        return gpsRechargeService.create(request, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public GpsRechargeDto update(@PathVariable UUID id, @Valid @RequestBody GpsRechargeRequest request) {
        return gpsRechargeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        gpsRechargeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
