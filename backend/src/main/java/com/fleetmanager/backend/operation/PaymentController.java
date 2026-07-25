package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.operation.dto.PaymentDto;
import com.fleetmanager.backend.operation.dto.PaymentRequest;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public List<PaymentDto> findAll(@AuthenticationPrincipal UserPrincipal principal) {
        return paymentService.findAll(principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public PaymentDto create(@Valid @RequestBody PaymentRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        return paymentService.create(request, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public PaymentDto update(@PathVariable UUID id, @Valid @RequestBody PaymentRequest request) {
        return paymentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
