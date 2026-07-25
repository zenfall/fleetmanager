package com.fleetmanager.backend.driver;

import com.fleetmanager.backend.driver.dto.DriverDto;
import com.fleetmanager.backend.driver.dto.DriverRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public List<DriverDto> findAll() {
        return driverService.findAll();
    }

    @GetMapping("/{id}")
    public DriverDto findById(@PathVariable UUID id) {
        return driverService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public DriverDto create(@Valid @RequestBody DriverRequest request) {
        return driverService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027,\u0027AGENT\u0027)")
    public DriverDto update(@PathVariable UUID id, @Valid @RequestBody DriverRequest request) {
        return driverService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole(\u0027ADMIN\u0027,\u0027SUPERVISEUR\u0027)")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        driverService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
