package com.carbontrack.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@carbontrack.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
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
            log.warn("Failed to send email to {}: {}", toEmail, e.getMessage());
            System.out.println("--- EMAIL SIMULATION ---");
            System.out.println("To: " + toEmail);
            System.out.println("Link: " + resetLink);
            System.out.println("------------------------");
        }
    }

    @Async
    public void sendNotificationAlertEmail(String toEmail, String subject, String alertMessage) {
        if (toEmail == null || toEmail.isBlank()) return;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("CarbonTrack Alert - " + subject);
            message.setText("Hello,\n\n" +
                    alertMessage + "\n\n" +
                    "Log in to your CarbonTrack dashboard to view details and manage your sustainability goals:\n" +
                    "http://localhost:5173/dashboard\n\n" +
                    "Best regards,\nCarbonTrack Sustainability Team");

            mailSender.send(message);
            log.info("✅ SUCCESS: Notification email successfully dispatched via Gmail SMTP to {}!", toEmail);
        } catch (Exception e) {
            log.warn("SMTP Error sending email to {}: {}", toEmail, e.getMessage());
            System.out.println("--- EMAIL ALERT SIMULATION ---");
            System.out.println("To: " + toEmail);
            System.out.println("Subject: " + subject);
            System.out.println("Message: " + alertMessage);
            System.out.println("------------------------------");
        }
    }
}
