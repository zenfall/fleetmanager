package com.fleetmanager.backend.dashboard;

import com.fleetmanager.backend.alert.AlertService;
import com.fleetmanager.backend.dashboard.dto.DashboardStatsDto;
import com.fleetmanager.backend.driver.DriverRepository;
import com.fleetmanager.backend.driver.DriverStatus;
import com.fleetmanager.backend.operation.ExpenseRepository;
import com.fleetmanager.backend.operation.GpsRechargeRepository;
import com.fleetmanager.backend.operation.OilChangeRepository;
import com.fleetmanager.backend.operation.PaymentRepository;
import com.fleetmanager.backend.vehicle.VehicleRepository;
import com.fleetmanager.backend.vehicle.VehicleStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final PaymentRepository paymentRepository;
    private final OilChangeRepository oilChangeRepository;
    private final GpsRechargeRepository gpsRechargeRepository;
    private final ExpenseRepository expenseRepository;
    private final AlertService alertService;

    @Transactional(readOnly = true)
    public DashboardStatsDto computeStats() {
        long totalVehicles = vehicleRepository.count();
        long activeVehicles = vehicleRepository.findAll().stream().filter(v -> v.getStatus() == VehicleStatus.active).count();
        long maintenanceVehicles = vehicleRepository.findAll().stream().filter(v -> v.getStatus() == VehicleStatus.maintenance).count();

        long totalDrivers = driverRepository.count();
        long activeDrivers = driverRepository.findAll().stream().filter(d -> d.getStatus() == DriverStatus.active).count();

        BigDecimal totalIncome = paymentRepository.findAll().stream()
                .map(p -> p.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = oilChangeRepository.findAll().stream().map(o -> o.getCost()).reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(gpsRechargeRepository.findAll().stream().map(g -> g.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add))
                .add(expenseRepository.findAll().stream().map(e -> e.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add));

        long alertsCount = alertService.computeAlerts().size();

        return new DashboardStatsDto(
                totalVehicles, activeVehicles, maintenanceVehicles,
                totalDrivers, activeDrivers,
                totalIncome, totalExpenses, totalIncome.subtract(totalExpenses),
                alertsCount
        );
    }
}
