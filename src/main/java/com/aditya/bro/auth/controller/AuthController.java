package com.aditya.bro.auth.controller;

import com.aditya.bro.auth.dto.LoginRequest;
import com.aditya.bro.auth.dto.SignupRequest;
import com.aditya.bro.auth.entity.User;
import com.aditya.bro.auth.repository.UserRepository;
import com.aditya.bro.auth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequest request) {
        if (userRepository.findByWalletAddress(request.getWalletAddress()).isPresent()) {
            return ResponseEntity.badRequest().body("Wallet already registered");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(null, request.getWalletAddress(), request.getUsername(), encodedPassword, request.getRole());
        userRepository.save(user);
        return ResponseEntity.ok("Signup successful");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        Optional<User> found = userRepository.findByWalletAddress(request.getWalletAddress());
        User user = found.orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getWalletAddress());
        return ResponseEntity.ok(token);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }

        String token = authHeader.replace("Bearer ", "").trim();

        if (!jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }

        String walletAddress = jwtUtil.extractUsername(token);

        Optional<User> user = userRepository.findByWalletAddress(walletAddress);

        return user.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("User not found"));
    }
}
