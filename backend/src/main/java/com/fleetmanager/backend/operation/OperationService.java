package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.operation.dto.OperationItemDto;
import com.fleetmanager.backend.security.UserPrincipal;
import com.fleetmanager.backend.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Vue transversale ("Vue 360") sur toutes les saisies (versements, vidanges, recharges GPS,
 * depenses). Reservee en acces complet aux roles SUPERVISEUR et ADMIN ; un AGENT ne voit
 * que ses propres saisies (voir filtrage applique dans findOperations).
 */
@Service
@RequiredArgsConstructor
public class OperationService {

    private final PaymentRepository paymentRepository;
    private final OilChangeRepository oilChangeRepository;
    private final GpsRechargeRepository gpsRechargeRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public List<OperationItemDto> findOperations(
            LocalDate dateFrom, LocalDate dateTo, UUID vehicleId, UUID driverId,
            OperationType type, UserPrincipal principal
    ) {
        boolean fullAccess = "ADMIN".equals(principal.getRole()) || "SUPERVISEUR".equals(principal.getRole());

        List<OperationItemDto> items = new ArrayList<>();

        if (type == null || type == OperationType.payment) {
            var stream = fullAccess ? paymentRepository.findAll() : paymentRepository.findByCreatedById(principal.getId());
            stream.forEach(p -> items.add(new OperationItemDto(
                    p.getId(), OperationType.payment, p.getDate(),
                    p.getVehicle().getId(), p.getVehicle().getName(),
                    p.getDriver() != null ? p.getDriver().getId() : null,
                    p.getDriver() != null ? p.getDriver().getName() : null,
                    p.getAmount(), true, "Versement", null,
                    p.getCreatedBy() != null ? p.getCreatedBy().getName() : null
            )));
        }

        if (type == null || type == OperationType.oilChange) {
            var stream = fullAccess ? oilChangeRepository.findAll() : oilChangeRepository.findByCreatedById(principal.getId());
            stream.forEach(o -> items.add(new OperationItemDto(
                    o.getId(), OperationType.oilChange, o.getDate(),
                    o.getVehicle().getId(), o.getVehicle().getName(),
                    o.getDriver() != null ? o.getDriver().getId() : null,
                    o.getDriver() != null ? o.getDriver().getName() : null,
                    o.getCost(), false, "Vidange (" + o.getMileage() + " km)", null,
                    o.getCreatedBy() != null ? o.getCreatedBy().getName() : null
            )));
        }

        if (type == null || type == OperationType.gps) {
            var stream = fullAccess ? gpsRechargeRepository.findAll() : gpsRechargeRepository.findByCreatedById(principal.getId());
            stream.forEach(g -> items.add(new OperationItemDto(
                    g.getId(), OperationType.gps, g.getDate(),
                    g.getVehicle().getId(), g.getVehicle().getName(),
                    g.getDriver() != null ? g.getDriver().getId() : null,
                    g.getDriver() != null ? g.getDriver().getName() : null,
                    g.getAmount(), false, "Recharge GPS" + (g.getProvider() != null ? " (" + g.getProvider() + ")" : ""), null,
                    g.getCreatedBy() != null ? g.getCreatedBy().getName() : null
            )));
        }

        if (type == null || type == OperationType.expense) {
            var stream = fullAccess ? expenseRepository.findAll() : expenseRepository.findByCreatedById(principal.getId());
            stream.forEach(e -> items.add(new OperationItemDto(
                    e.getId(), OperationType.expense, e.getDate(),
                    e.getVehicle().getId(), e.getVehicle().getName(),
                    e.getDriver() != null ? e.getDriver().getId() : null,
                    e.getDriver() != null ? e.getDriver().getName() : null,
                    e.getAmount(), false, e.getDescription(), e.getCategory(),
                    e.getCreatedBy() != null ? e.getCreatedBy().getName() : null
            )));
        }

        return items.stream()
                .filter(i -> dateFrom == null || !i.date().isBefore(dateFrom))
                .filter(i -> dateTo == null || !i.date().isAfter(dateTo))
                .filter(i -> vehicleId == null || vehicleId.equals(i.vehicleId()))
                .filter(i -> driverId == null || driverId.equals(i.driverId()))
                .sorted(Comparator.comparing(OperationItemDto::date).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public String exportCsv(LocalDate dateFrom, LocalDate dateTo, UUID vehicleId, UUID driverId,
                             OperationType type, UserPrincipal principal) {
        List<OperationItemDto> items = findOperations(dateFrom, dateTo, vehicleId, driverId, type, principal);
        StringBuilder sb = new StringBuilder();
        sb.append("Date,Type,Vehicule,Chauffeur,Montant,Sens,Description,Categorie,Saisi par\n");
        for (OperationItemDto i : items) {
            sb.append(i.date()).append(",")
              .append(i.type()).append(",")
              .append(csvSafe(i.vehicleName())).append(",")
              .append(csvSafe(i.driverName())).append(",")
              .append(i.amount()).append(",")
              .append(i.isIncome() ? "Recette" : "Charge").append(",")
              .append(csvSafe(i.description())).append(",")
              .append(i.category() != null ? i.category() : "").append(",")
              .append(csvSafe(i.createdByName()))
              .append("\n");
        }
        return sb.toString();
    }

    private String csvSafe(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        return escaped.contains(",") ? "\"" + escaped + "\"" : escaped;
    }
}
