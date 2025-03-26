package com.Ticket.ProjetS4.controller;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Ticket.ProjetS4.Security.JwtUtil;
import com.Ticket.ProjetS4.dto.Authresponse;
import com.Ticket.ProjetS4.dto.ForgotPasswordRequest;
import com.Ticket.ProjetS4.dto.LoginRequest;
import com.Ticket.ProjetS4.dto.RegisterRequest;
import com.Ticket.ProjetS4.dto.ResetPasswordRequest;
import com.Ticket.ProjetS4.models.Role;
import com.Ticket.ProjetS4.models.User;
import com.Ticket.ProjetS4.models.VerificationToken;
import com.Ticket.ProjetS4.repository.UserRepository;
import com.Ticket.ProjetS4.repository.VerificationTokenRepository;
import com.Ticket.ProjetS4.services.EmailService;

import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final VerificationTokenRepository verificationTokenRepository;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            EmailService emailService, VerificationTokenRepository verificationTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.verificationTokenRepository = verificationTokenRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) throws MessagingException {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already taken!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setVerified(false); // Mark as unverified

        userRepository.save(user);

        // Generate a verification token
        String token = UUID.randomUUID().toString();
        verificationTokenRepository.save(new VerificationToken(token, user));

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);

        return ResponseEntity.ok("User registered. Please verify your email.");
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        Optional<VerificationToken> verificationTokenOpt = verificationTokenRepository.findByToken(token);

        if (verificationTokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }

        VerificationToken verificationToken = verificationTokenOpt.get();
        User user = verificationToken.getUser();
        user.setVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken); // Remove token after verification

        // Redirect to frontend success page
        return ResponseEntity.status(302) // HTTP 302 for redirection
                .header("Location", "http://127.0.0.1:5500/html/verification.html") // Redirect to frontend page
                .build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            return ResponseEntity.badRequest().body("Please verify your email first.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(new Authresponse(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString(); // Generate random token
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusMinutes(30)); // Token expires in 30 minutes

        userRepository.save(user);

        // Send email with reset link (Modify this link for frontend)
        String resetLink = "http://127.0.0.1:5500/html/reset-password.html?token=" + token;
        try {
            emailService.sendEmail(user.getEmail(), "Reset Your Password",
                    "Click the link below to reset your password:\n" + resetLink);
        } catch (MessagingException e) {
            return ResponseEntity.status(500).body("Failed to send email. Please try again later.");
        }

        return ResponseEntity.ok("Password reset link sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByResetToken(request.getToken());

        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired token.");
        }

        User user = userOptional.get();

        // Check if token is expired
        if (user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token has expired.");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null); // Remove token after successful reset
        user.setTokenExpiry(null);

        userRepository.save(user);

        return ResponseEntity.ok("Password reset successful.");
    }
}
