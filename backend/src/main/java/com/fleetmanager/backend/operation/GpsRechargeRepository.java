package com.fleetmanager.backend.operation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface GpsRechargeRepository extends JpaRepository<GpsRecharge, UUID> {
    List<GpsRecharge> findByCreatedById(UUID userId);
}
