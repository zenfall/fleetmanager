package com.fleetmanager.backend.assignment;

import com.fleetmanager.backend.assignment.dto.AssignDriverRequest;
import com.fleetmanager.backend.assignment.dto.AssignmentDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public List<AssignmentDto> findAll() {
        return assignmentService.findAll();
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<AssignmentDto> byVehicle(@PathVariable UUID vehicleId) {
        return assignmentService.findByVehicle(vehicleId);
    }

    @GetMapping("/driver/{driverId}")
    public List<AssignmentDto> byDriver(@PathVariable UUID driverId) {
        return assignmentService.findByDriver(driverId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public AssignmentDto assign(@Valid @RequestBody AssignDriverRequest request) {
        return assignmentService.assignDriver(request);
    }

    @PostMapping("/vehicle/{vehicleId}/end")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public ResponseEntity<Void> end(@PathVariable UUID vehicleId, @RequestParam(required = false) LocalDate endDate) {
        assignmentService.endAssignment(vehicleId, endDate);
        return ResponseEntity.noContent().build();
    }
}
