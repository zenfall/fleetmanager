package com.fleetmanager.backend.driver;

import com.fleetmanager.backend.assignment.Assignment;
import com.fleetmanager.backend.assignment.AssignmentRepository;
import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.driver.dto.DriverDto;
import com.fleetmanager.backend.driver.dto.DriverRequest;
import com.fleetmanager.backend.vehicle.Vehicle;
import com.fleetmanager.backend.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final AssignmentRepository assignmentRepository;

    @Transactional(readOnly = true)
    public List<DriverDto> findAll() {
        return driverRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public DriverDto findById(UUID id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public DriverDto create(DriverRequest request) {
        Driver driver = Driver.builder()
                .name(request.name())
                .phone(request.phone())
                .licenseNumber(request.licenseNumber())
                .status(request.status() != null ? request.status() : DriverStatus.active)
                .note(request.note())
                .build();
        return toDto(driverRepository.save(driver));
    }

    @Transactional
    public DriverDto update(UUID id, DriverRequest request) {
        Driver driver = getOrThrow(id);
        driver.setName(request.name());
        driver.setPhone(request.phone());
        driver.setLicenseNumber(request.licenseNumber());
        if (request.status() != null) driver.setStatus(request.status());
        driver.setNote(request.note());
        return toDto(driverRepository.save(driver));
    }

    @Transactional
    public void delete(UUID id) {
        Driver driver = getOrThrow(id);

        LocalDate today = LocalDate.now();
        assignmentRepository.findByDriverIdAndEndDateIsNull(id)
                .forEach(a -> a.setEndDate(today));

        vehicleRepository.findAll().stream()
                .filter(v -> v.getCurrentDriver() != null && v.getCurrentDriver().getId().equals(id))
                .forEach(v -> v.setCurrentDriver(null));

        driverRepository.delete(driver);
    }

    Driver getOrThrow(UUID id) {
        return driverRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", id));
    }

    private DriverDto toDto(Driver d) {
        return new DriverDto(d.getId(), d.getName(), d.getPhone(), d.getLicenseNumber(), d.getStatus(), d.getNote(), d.getCreatedAt());
    }
}
