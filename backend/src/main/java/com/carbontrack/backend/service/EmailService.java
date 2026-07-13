package com.carbontrack.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@carbontrack.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CarbonTrack - Password Reset Request");
            message.setText("Hello,\n\n" +
                    "You requested to reset your password. Click the link below to set a new password:\n\n" +
                    resetLink + "\n\n" +
                    "This link will expire in 30 minutes.\n\n" +
                    "If you didn't request this, you can safely ignore this email.\n\n" +
                    "Best,\nCarbonTrack Team");

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ". " + e.getMessage());
            // In a real application, you might want to throw a custom exception here or use a message queue.
            // For now, we print it so the flow continues even if SMTP is not configured.
            System.out.println("--- EMAIL SIMULATION ---");
            System.out.println("To: " + toEmail);
            System.out.println("Link: " + resetLink);
            System.out.println("------------------------");
        }
    }
}
