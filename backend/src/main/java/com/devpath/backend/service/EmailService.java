package com.devpath.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendResetMail(String to, String link) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Şifre Sıfırlama Talebi - DevPath");
        message.setText("Merhaba,\n\nŞifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n\n" 
                        + link + "\n\nİyi çalışmalar!");

        mailSender.send(message);
    }
}
