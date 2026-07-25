package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.driver.Driver;
import com.fleetmanager.backend.driver.DriverRepository;
import com.fleetmanager.backend.operation.dto.ExpenseDto;
import com.fleetmanager.backend.operation.dto.ExpenseRequest;
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
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ExpenseDto> findAll(UserPrincipal principal) {
        boolean fullAccess = "ADMIN".equals(principal.getRole()) || "SUPERVISEUR".equals(principal.getRole());
        var items = fullAccess ? expenseRepository.findAll() : expenseRepository.findByCreatedById(principal.getId());
        return items.stream().map(this::toDto).toList();
    }

    @Transactional
    public ExpenseDto create(ExpenseRequest request, UserPrincipal principal) {
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        User creator = userRepository.findById(principal.getId()).orElse(null);

        Expense expense = Expense.builder()
                .vehicle(vehicle).driver(driver)
                .date(request.date()).amount(request.amount()).category(request.category())
                .description(request.description()).createdBy(creator)
                .build();
        return toDto(expenseRepository.save(expense));
    }


    @Transactional
    public ExpenseDto update(java.util.UUID id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Depense", id));
        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicule", request.vehicleId()));
        Driver driver = request.driverId() != null
                ? driverRepository.findById(request.driverId()).orElseThrow(() -> ResourceNotFoundException.of("Chauffeur", request.driverId()))
                : null;
        expense.setVehicle(vehicle);
        expense.setDriver(driver);
        expense.setDate(request.date());
        expense.setAmount(request.amount());
        expense.setCategory(request.category());
        expense.setDescription(request.description());
        return toDto(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(java.util.UUID id) {
        if (!expenseRepository.existsById(id)) throw ResourceNotFoundException.of("Depense", id);
        expenseRepository.deleteById(id);
    }

    private ExpenseDto toDto(Expense e) {
        return new ExpenseDto(e.getId(), e.getVehicle().getId(), e.getVehicle().getName(),
                e.getDriver() != null ? e.getDriver().getId() : null,
                e.getDriver() != null ? e.getDriver().getName() : null,
                e.getDate(), e.getAmount(), e.getCategory(), e.getDescription(),
                e.getCreatedBy() != null ? e.getCreatedBy().getName() : null);
    }
}
