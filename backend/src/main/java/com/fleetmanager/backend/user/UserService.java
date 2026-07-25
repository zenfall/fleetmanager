package com.fleetmanager.backend.user;

import com.fleetmanager.backend.common.exception.ConflictException;
import com.fleetmanager.backend.common.exception.ResourceNotFoundException;
import com.fleetmanager.backend.user.dto.CreateUserRequest;
import com.fleetmanager.backend.user.dto.UpdateUserRequest;
import com.fleetmanager.backend.user.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserDto> findAll() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public UserDto findById(UUID id) {
        return toDto(getOrThrow(id));
    }

    @Transactional
    public UserDto create(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ConflictException("Un utilisateur avec cet email existe deja");
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .active(true)
                .build();
        return toDto(userRepository.save(user));
    }

    @Transactional
    public UserDto update(UUID id, UpdateUserRequest request) {
        User user = getOrThrow(id);
        if (request.name() != null) user.setName(request.name());
        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(request.email())) {
                throw new ConflictException("Un utilisateur avec cet email existe deja");
            }
            user.setEmail(request.email().toLowerCase());
        }
        if (request.role() != null) user.setRole(request.role());
        if (request.active() != null) user.setActive(request.active());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void delete(UUID id) {
        if (!userRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Utilisateur", id);
        }
        userRepository.deleteById(id);
    }

    User getOrThrow(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Utilisateur", id));
    }

    private UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.isActive(), u.getCreatedAt());
    }
}
