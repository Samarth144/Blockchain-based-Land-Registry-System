package com.aditya.bro.auth.service;

import com.aditya.bro.auth.entity.User;
import com.aditya.bro.auth.repository.UserRepository;
import com.aditya.bro.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder;

    public User signup(User user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<String> login(String walletAddress, String password) {
        return userRepository.findByWalletAddress(walletAddress)
                .filter(u -> encoder.matches(password, u.getPassword()))
                .map(u -> jwtUtil.generateToken(u.getWalletAddress()));
    }

    public Optional<User> getUserByToken(String token) {
        if (!jwtUtil.validateToken(token)) return Optional.empty();
        String walletAddress = jwtUtil.extractUsername(token);
        return userRepository.findByWalletAddress(walletAddress);
    }
}