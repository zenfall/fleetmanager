package com.fleetmanager.backend.alert;

import com.fleetmanager.backend.operation.OilChangeRepository;
import com.fleetmanager.backend.vehicle.Vehicle;
import com.fleetmanager.backend.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Genere les alertes calculees (non stockees) : vidange a prevoir, expiration GPS proche/depassee.
 * Utilisees par le tableau de bord (tous roles) et resumees dans la vue 360 superviseur.
 */
@Service
@RequiredArgsConstructor
public class AlertService {

    private final VehicleRepository vehicleRepository;
    private final OilChangeRepository oilChangeRepository;

    private static final int GPS_WARNING_DAYS = 15;
    private static final int OIL_WARNING_DAYS = 7;

    @Transactional(readOnly = true)
    public List<AlertDto> computeAlerts() {
        List<AlertDto> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        List<Vehicle> vehicles = vehicleRepository.findAll();

        Map<java.util.UUID, LocalDate> lastOilChangeByVehicle = oilChangeRepository.findAll().stream()
                .collect(Collectors.toMap(
                        o -> o.getVehicle().getId(),
                        o -> o.getNextChangeDate(),
                        (a, b) -> {
                            if (a == null) return b;
                            if (b == null) return a;
                            return a.isAfter(b) ? a : b;
                        }
                ));

        for (Vehicle v : vehicles) {
            if (v.getGpsExpiryDate() != null) {
                long daysLeft = today.until(v.getGpsExpiryDate()).getDays();
                if (daysLeft < 0) {
                    alerts.add(new AlertDto("gps-" + v.getId(), v.getId(), v.getName(), AlertType.gps_expiry,
                            "GPS expire depuis le " + v.getGpsExpiryDate(), Severity.danger, v.getGpsExpiryDate()));
                } else if (daysLeft <= GPS_WARNING_DAYS) {
                    alerts.add(new AlertDto("gps-" + v.getId(), v.getId(), v.getName(), AlertType.gps_expiry,
                            "GPS expire dans " + daysLeft + " jour(s)", Severity.warning, v.getGpsExpiryDate()));
                }
            }

            LocalDate nextOil = lastOilChangeByVehicle.get(v.getId());
            if (nextOil != null) {
                long daysLeft = today.until(nextOil).getDays();
                if (daysLeft < 0) {
                    alerts.add(new AlertDto("oil-" + v.getId(), v.getId(), v.getName(), AlertType.oil_change,
                            "Vidange en retard depuis le " + nextOil, Severity.danger, nextOil));
                } else if (daysLeft <= OIL_WARNING_DAYS) {
                    alerts.add(new AlertDto("oil-" + v.getId(), v.getId(), v.getName(), AlertType.oil_change,
                            "Vidange a prevoir dans " + daysLeft + " jour(s)", Severity.warning, nextOil));
                }
            }
        }

        return alerts.stream()
                .sorted(Comparator.comparing(AlertDto::severity).reversed().thenComparing(AlertDto::date))
                .toList();
    }
}
