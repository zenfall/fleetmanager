package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.operation.dto.OperationItemDto;
import com.fleetmanager.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Vue Operations transversale ("Vue 360").
 * ADMIN / SUPERVISEUR : acces a toutes les saisies, tous agents confondus.
 * AGENT : acces restreint a ses propres saisies.
 */
@RestController
@RequestMapping("/api/operations")
@RequiredArgsConstructor
public class OperationController {

    private final OperationService operationService;

    @GetMapping
    public List<OperationItemDto> findOperations(
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) OperationType type,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return operationService.findOperations(dateFrom, dateTo, vehicleId, driverId, type, principal);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId,
            @RequestParam(required = false) OperationType type,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String csv = operationService.exportCsv(dateFrom, dateTo, vehicleId, driverId, type, principal);
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"operations.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }
}
