package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.driver.Driver;
import com.fleetmanager.backend.driver.DriverRepository;
import com.fleetmanager.backend.operation.dto.OilChangeDto;
import com.fleetmanager.backend.operation.dto.OilChangeRequest;
import com.fleetmanager.backend.security.UserPrincipal;
import com.fleetmanager.backend.user.User;
import com.fleetmanager.backend.user.UserRepository;
import com.fleetmanager.backend.vehicle.Vehicle;
import com.fleetmanager.backend.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OilChangeService {

    private final OilChangeRepository oilChangeRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<OilChangeDto> findAll(UserPrincipal principal) {
        boolean fullAccess = "ADMIN".equals(principal.getRole()) || "SUPERVISEUR".equals(principal.getRole());
        var items = fullAccess ? oilChangeRepository.findAll() : oilChangeRepository.findByCreatedById(principal.getId());
        return items.stream().map(this::toDto).toList();
    }

    @Transactional
    public OilChangeDto create(OilChangeRequest request, UserPrincipal principal) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        User creator = userRepository.findById(principal.getId()).orElse(null);

        OilChange oilChange = OilChange.builder()
                .vehicle(vehicle).driver(driver)
                .date(request.date()).mileage(request.mileage()).cost(request.cost())
                .nextChangeDays(request.nextChangeDays()).nextChangeDate(request.nextChangeDate())
                .note(request.note()).createdBy(creator)
                .build();
        return toDto(oilChangeRepository.save(oilChange));
    }


    @Transactional
    public OilChangeDto update(java.util.UUID id, OilChangeRequest request) {
        OilChange oilChange = oilChangeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Vidange", id));
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        oilChange.setVehicle(vehicle);
        oilChange.setDriver(driver);
        oilChange.setDate(request.date());
        oilChange.setMileage(request.mileage());
        oilChange.setCost(request.cost());
        oilChange.setNextChangeDays(request.nextChangeDays());
        oilChange.setNextChangeDate(request.nextChangeDate());
        oilChange.setNote(request.note());
        return toDto(oilChangeRepository.save(oilChange));
    }

    @Transactional
    public void delete(java.util.UUID id) {
        if (!oilChangeRepository.existsById(id)) throw ResourceNotFoundException.of("Vidange", id);
        oilChangeRepository.deleteById(id);
    }

    private OilChangeDto toDto(OilChange o) {
        return new OilChangeDto(o.getId(), o.getVehicle().getId(), o.getVehicle().getName(),
                o.getDriver() != null ? o.getDriver().getId() : null,
                o.getDriver() != null ? o.getDriver().getName() : null,
                o.getDate(), o.getMileage(), o.getCost(), o.getNextChangeDays(), o.getNextChangeDate(),
                o.getNote(), o.getCreatedBy() != null ? o.getCreatedBy().getName() : null);
    }
}
