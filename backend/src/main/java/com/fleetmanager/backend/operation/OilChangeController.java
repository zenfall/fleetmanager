package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.operation.dto.OilChangeDto;
import com.fleetmanager.backend.operation.dto.OilChangeRequest;
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
@RequestMapping("/api/oil-changes")
@RequiredArgsConstructor
public class OilChangeController {

    private final OilChangeService oilChangeService;

    @GetMapping
    public List<OilChangeDto> findAll(@AuthenticationPrincipal UserPrincipal principal) {
        return oilChangeService.findAll(principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public OilChangeDto create(@Valid @RequestBody OilChangeRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        return oilChangeService.create(request, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public OilChangeDto update(@PathVariable UUID id, @Valid @RequestBody OilChangeRequest request) {
        return oilChangeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        oilChangeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
