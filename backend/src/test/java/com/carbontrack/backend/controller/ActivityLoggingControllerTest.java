package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.ActivityLogRequest;
import com.carbontrack.backend.service.ActivityLoggingService;
import com.carbontrack.backend.security.JwtAuthFilter;
import com.carbontrack.backend.security.UserDetailsServiceImpl;
import com.carbontrack.backend.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ActivityLoggingController.class)
class ActivityLoggingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ActivityLoggingService activityLoggingService;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser
    void whenValidInput_thenReturns200() throws Exception {
        ActivityLogRequest request = new ActivityLogRequest("transport", "car", 15.5, "km", LocalDate.now());

        mockMvc.perform(post("/api/activity-logs")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void whenInvalidCategory_thenReturns400() throws Exception {
        ActivityLogRequest request = new ActivityLogRequest("invalid-category", "car", 15.5, "km", LocalDate.now());

        mockMvc.perform(post("/api/activity-logs")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void whenNegativeQuantity_thenReturns400() throws Exception {
        ActivityLogRequest request = new ActivityLogRequest("transport", "car", -1.0, "km", LocalDate.now());

        mockMvc.perform(post("/api/activity-logs")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void whenBlankActivityType_thenReturns400() throws Exception {
        ActivityLogRequest request = new ActivityLogRequest("transport", "", 10.0, "km", LocalDate.now());

        mockMvc.perform(post("/api/activity-logs")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
