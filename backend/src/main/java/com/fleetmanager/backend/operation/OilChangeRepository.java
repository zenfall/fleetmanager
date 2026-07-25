package com.fleetmanager.backend.operation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OilChangeRepository extends JpaRepository<OilChange, UUID> {
    List<OilChange> findByCreatedById(UUID userId);
}
