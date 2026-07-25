package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.operation.dto.ExpenseDto;
import com.fleetmanager.backend.operation.dto.ExpenseRequest;
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
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public List<ExpenseDto> findAll(@AuthenticationPrincipal UserPrincipal principal) {
        return expenseService.findAll(principal);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public ExpenseDto create(@Valid @RequestBody ExpenseRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        return expenseService.create(request, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public ExpenseDto update(@PathVariable UUID id, @Valid @RequestBody ExpenseRequest request) {
        return expenseService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        expenseService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
