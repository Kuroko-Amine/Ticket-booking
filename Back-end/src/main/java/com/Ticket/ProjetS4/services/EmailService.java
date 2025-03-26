package com.Ticket.ProjetS4.services;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) throws MessagingException {
        String subject = "Email Verification";
        String verificationLink = "http://localhost:8080/api/auth/verify?token=" + token;
        String content = "<p>Click the link below to verify your email:</p>"
                        + "<a href=\"" + verificationLink + "\">Verify Email</a>";

        sendEmail(toEmail, subject, content);
    }

    public void sendResetPasswordEmail(String toEmail, String token) throws MessagingException {
        String subject = "Reset Your Password";
        String resetLink = "http://127.0.0.1:5500/reset-password.html?token=" + token;
        String content = "<p>Click the link below to reset your password:</p>"
                        + "<a href=\"" + resetLink + "\">Reset Password</a>";

        sendEmail(toEmail, subject, content);
    }

    public void sendEmail(String toEmail, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
    }
}
