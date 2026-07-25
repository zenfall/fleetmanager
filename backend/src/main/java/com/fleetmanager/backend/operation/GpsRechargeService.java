package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.driver.Driver;
import com.fleetmanager.backend.driver.DriverRepository;
import com.fleetmanager.backend.operation.dto.GpsRechargeDto;
import com.fleetmanager.backend.operation.dto.GpsRechargeRequest;
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
public class GpsRechargeService {

    private final GpsRechargeRepository gpsRechargeRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<GpsRechargeDto> findAll(UserPrincipal principal) {
        boolean fullAccess = "ADMIN".equals(principal.getRole()) || "SUPERVISEUR".equals(principal.getRole());
        var items = fullAccess ? gpsRechargeRepository.findAll() : gpsRechargeRepository.findByCreatedById(principal.getId());
        return items.stream().map(this::toDto).toList();
    }

    @Transactional
    public GpsRechargeDto create(GpsRechargeRequest request, UserPrincipal principal) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        User creator = userRepository.findById(principal.getId()).orElse(null);

        GpsRecharge recharge = GpsRecharge.builder()
                .vehicle(vehicle).driver(driver)
                .date(request.date()).amount(request.amount())
                .validityDays(request.validityDays()).expiryDate(request.expiryDate())
                .provider(request.provider()).createdBy(creator)
                .build();
        GpsRecharge saved = gpsRechargeRepository.save(recharge);

        if (request.expiryDate() != null) {
            vehicle.setGpsExpiryDate(request.expiryDate());
            vehicleRepository.save(vehicle);
        }
        return toDto(saved);
    }


    @Transactional
    public GpsRechargeDto update(java.util.UUID id, GpsRechargeRequest request) {
        GpsRecharge recharge = gpsRechargeRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Recharge GPS", id));
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        recharge.setVehicle(vehicle);
        recharge.setDriver(driver);
        recharge.setDate(request.date());
        recharge.setAmount(request.amount());
        recharge.setValidityDays(request.validityDays());
        recharge.setExpiryDate(request.expiryDate());
        recharge.setProvider(request.provider());
        GpsRecharge saved = gpsRechargeRepository.save(recharge);
        if (request.expiryDate() != null) {
            vehicle.setGpsExpiryDate(request.expiryDate());
            vehicleRepository.save(vehicle);
        }
        return toDto(saved);
    }

    @Transactional
    public void delete(java.util.UUID id) {
        if (!gpsRechargeRepository.existsById(id)) throw ResourceNotFoundException.of("Recharge GPS", id);
        gpsRechargeRepository.deleteById(id);
    }

    private GpsRechargeDto toDto(GpsRecharge g) {
        return new GpsRechargeDto(g.getId(), g.getVehicle().getId(), g.getVehicle().getName(),
                g.getDriver() != null ? g.getDriver().getId() : null,
                g.getDriver() != null ? g.getDriver().getName() : null,
                g.getDate(), g.getAmount(), g.getValidityDays(), g.getExpiryDate(), g.getProvider(),
                g.getCreatedBy() != null ? g.getCreatedBy().getName() : null);
    }
}
