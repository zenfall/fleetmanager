package com.fleetmanager.backend.operation;

import com.fleetmanager.backend.driver.Driver;
import com.fleetmanager.backend.user.User;
import com.fleetmanager.backend.vehicle.Vehicle;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "oil_changes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OilChange {
    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Integer mileage;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal cost;

    @Column(name = "next_change_days")
    private Integer nextChangeDays;

    @Column(name = "next_change_date")
    private LocalDate nextChangeDate;

    @Column(columnDefinition = "TEXT")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { this.createdAt = Instant.now(); }
}
