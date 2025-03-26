package com.Ticket.ProjetS4.repository;



import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Ticket.ProjetS4.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByResetToken(String resetToken);
}


