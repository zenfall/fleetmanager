package com.fleetmanager.backend.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    boolean existsByPlateIgnoreCase(String plate);
}
