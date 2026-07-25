package com.fleetmanager.backend.vehicle;

import com.fleetmanager.backend.assignment.AssignmentRepository;
import com.fleetmanager.backend.common.exception.ConflictException;
import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.vehicle.dto.VehicleDto;
import com.fleetmanager.backend.vehicle.dto.VehicleRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final AssignmentRepository assignmentRepository;

    @Transactional(readOnly = true)
    public List<VehicleDto> findAll() {
        return vehicleRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public VehicleDto findById(UUID id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public VehicleDto create(VehicleRequest request) {
        if (vehicleRepository.existsByPlateIgnoreCase(request.plate())) {
            throw new ConflictException("Un vehicule avec cette immatriculation existe deja");
        }
        Vehicle vehicle = Vehicle.builder()
                .name(request.name())
                .plate(request.plate())
                .status(request.status() != null ? request.status() : VehicleStatus.active)
                .gpsExpiryDate(request.gpsExpiryDate())
                .build();
        return toDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleDto update(UUID id, VehicleRequest request) {
        Vehicle vehicle = getOrThrow(id);
        if (!vehicle.getPlate().equalsIgnoreCase(request.plate())
                && vehicleRepository.existsByPlateIgnoreCase(request.plate())) {
            throw new ConflictException("Un vehicule avec cette immatriculation existe deja");
        }
        vehicle.setName(request.name());
        vehicle.setPlate(request.plate());
        if (request.status() != null) vehicle.setStatus(request.status());
        vehicle.setGpsExpiryDate(request.gpsExpiryDate());
        return toDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void delete(UUID id) {
        Vehicle vehicle = getOrThrow(id);
        LocalDate today = LocalDate.now();
        assignmentRepository.findByVehicleIdOrderByStartDateDesc(id).stream()
                .filter(a -> a.getEndDate() == null)
                .forEach(a -> a.setEndDate(today));
        vehicleRepository.delete(vehicle);
    }

    Vehicle getOrThrow(UUID id) {
        return vehicleRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Vehicule", id));
    }

    private VehicleDto toDto(Vehicle v) {
        return new VehicleDto(
                v.getId(), v.getName(), v.getPlate(),
                v.getCurrentDriver() != null ? v.getCurrentDriver().getId() : null,
                v.getCurrentDriver() != null ? v.getCurrentDriver().getName() : null,
                v.getStatus(), v.getGpsExpiryDate(), v.getCreatedAt()
        );
    }
}
