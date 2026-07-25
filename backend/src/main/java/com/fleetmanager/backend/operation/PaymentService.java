package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.driver.Driver;
import com.fleetmanager.backend.driver.DriverRepository;
import com.fleetmanager.backend.operation.dto.PaymentDto;
import com.fleetmanager.backend.operation.dto.PaymentRequest;
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
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PaymentDto> findAll(UserPrincipal principal) {
        boolean fullAccess = "ADMIN".equals(principal.getRole()) || "SUPERVISEUR".equals(principal.getRole());
        var items = fullAccess ? paymentRepository.findAll() : paymentRepository.findByCreatedById(principal.getId());
        return items.stream().map(this::toDto).toList();
    }

    @Transactional
    public PaymentDto create(PaymentRequest request, UserPrincipal principal) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        User creator = userRepository.findById(principal.getId()).orElse(null);

        Payment payment = Payment.builder()
                .vehicle(vehicle).driver(driver)
                .amount(request.amount()).date(request.date()).note(request.note())
                .createdBy(creator)
                .build();
        return toDto(paymentRepository.save(payment));
    }


    @Transactional
    public PaymentDto update(java.util.UUID id, PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Versement", id));
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        payment.setVehicle(vehicle);
        payment.setDriver(driver);
        payment.setAmount(request.amount());
        payment.setDate(request.date());
        payment.setNote(request.note());
        return toDto(paymentRepository.save(payment));
    }

    @Transactional
    public void delete(java.util.UUID id) {
        if (!paymentRepository.existsById(id)) throw ResourceNotFoundException.of("Versement", id);
        paymentRepository.deleteById(id);
    }

    private PaymentDto toDto(Payment p) {
        return new PaymentDto(p.getId(), p.getVehicle().getId(), p.getVehicle().getName(),
                p.getDriver() != null ? p.getDriver().getId() : null,
                p.getDriver() != null ? p.getDriver().getName() : null,
                p.getAmount(), p.getDate(), p.getNote(),
                p.getCreatedBy() != null ? p.getCreatedBy().getName() : null);
    }
}
