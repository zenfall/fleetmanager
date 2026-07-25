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
@Table(name = "gps_recharges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GpsRecharge {
    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "validity_days")
    private Integer validityDays;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    private String provider;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() { this.createdAt = Instant.now(); }
}
