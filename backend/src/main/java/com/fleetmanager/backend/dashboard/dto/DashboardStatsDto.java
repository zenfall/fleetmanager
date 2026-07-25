package com.fleetmanager.backend.dashboard.dto;

import java.math.BigDecimal;

public record DashboardStatsDto(
        long totalVehicles,
        long activeVehicles,
        long maintenanceVehicles,
        long totalDrivers,
        long activeDrivers,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal balance,
        long alertsCount
) {
}
