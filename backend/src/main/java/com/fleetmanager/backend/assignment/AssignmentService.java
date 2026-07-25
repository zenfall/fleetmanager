package com.fleetmanager.backend.assignment;

import com.fleetmanager.backend.assignment.dto.AssignDriverRequest;
import com.fleetmanager.backend.assignment.dto.AssignmentDto;
import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.driver.Driver;
import com.fleetmanager.backend.driver.DriverRepository;
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
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    @Transactional(readOnly = true)
    public List<AssignmentDto> findAll() {
        return assignmentRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> findByVehicle(UUID vehicleId) {
        return assignmentRepository.findByVehicleIdOrderByStartDateDesc(vehicleId).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> findByDriver(UUID driverId) {
        return assignmentRepository.findByDriverIdOrderByStartDateDesc(driverId).stream().map(this::toDto).toList();
    }

    /** Affecte un chauffeur a un vehicule : cloture l\u0027affectation active differente et met a jour le vehicule. */
    @Transactional
    public AssignmentDto assignDriver(AssignDriverRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = driverRepository.findById(request.driverId())
                .orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()));

        LocalDate start = request.startDate() != null ? request.startDate() : LocalDate.now();

        assignmentRepository.findByVehicleIdAndEndDateIsNull(vehicle.getId()).ifPresent(active -> {
            if (!active.getDriver().getId().equals(driver.getId())) {
                active.setEndDate(start);
            }
        });

        Assignment existing = assignmentRepository.findByVehicleIdAndEndDateIsNull(vehicle.getId())
                .filter(a -> a.getDriver().getId().equals(driver.getId()))
                .orElse(null);

        Assignment assignment = existing;
        if (assignment == null) {
            assignment = Assignment.builder()
                    .vehicle(vehicle)
                    .driver(driver)
                    .startDate(start)
                    .note(request.note())
                    .build();
            assignment = assignmentRepository.save(assignment);
        }

        vehicle.setCurrentDriver(driver);
        vehicleRepository.save(vehicle);

        return toDto(assignment);
    }

    /** Termine l\u0027affectation en cours d\u0027un vehicule. */
    @Transactional
    public void endAssignment(UUID vehicleId, LocalDate endDate) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", vehicleId));
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        assignmentRepository.findByVehicleIdAndEndDateIsNull(vehicleId)
                .ifPresent(a -> a.setEndDate(end));

        vehicle.setCurrentDriver(null);
        vehicleRepository.save(vehicle);
    }

    private AssignmentDto toDto(Assignment a) {
        return new AssignmentDto(
                a.getId(), a.getVehicle().getId(), a.getVehicle().getName(),
                a.getDriver().getId(), a.getDriver().getName(),
                a.getStartDate(), a.getEndDate(), a.getNote()
        );
    }
}
