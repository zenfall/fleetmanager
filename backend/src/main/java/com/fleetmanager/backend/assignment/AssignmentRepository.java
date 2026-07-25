package com.fleetmanager.backend.assignment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssignmentRepository extends JpaRepository<Assignment, UUID> {

    List<Assignment> findByVehicleIdOrderByStartDateDesc(UUID vehicleId);

    List<Assignment> findByDriverIdOrderByStartDateDesc(UUID driverId);

    Optional<Assignment> findByVehicleIdAndEndDateIsNull(UUID vehicleId);

    List<Assignment> findByDriverIdAndEndDateIsNull(UUID driverId);
}
