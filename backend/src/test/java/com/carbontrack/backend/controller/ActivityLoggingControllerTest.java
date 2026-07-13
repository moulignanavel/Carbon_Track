package com.carbontrack.backend.controller;

import com.carbontrack.backend.dto.*;
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
    void whenValidTransportInput_thenReturns200() throws Exception {
        TransportLogRequest request = new TransportLogRequest();
        request.setTransportMode("car");
        request.setDistance(15.5);
        request.setLogDate(LocalDate.now());

        mockMvc.perform(post("/api/activity-logs/transport")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void whenInvalidTransportMode_thenReturns400() throws Exception {
        TransportLogRequest request = new TransportLogRequest();
        request.setTransportMode("invalid-mode");
        request.setDistance(15.5);
        request.setLogDate(LocalDate.now());

        mockMvc.perform(post("/api/activity-logs/transport")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void whenNegativeDistance_thenReturns400() throws Exception {
        TransportLogRequest request = new TransportLogRequest();
        request.setTransportMode("car");
        request.setDistance(-1.0);
        request.setLogDate(LocalDate.now());

        mockMvc.perform(post("/api/activity-logs/transport")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void whenValidElectricityInput_thenReturns200() throws Exception {
        ElectricityLogRequest request = new ElectricityLogRequest();
        request.setEnergySource("grid");
        request.setKwhConsumed(50.0);
        request.setLogDate(LocalDate.now());

        mockMvc.perform(post("/api/activity-logs/electricity")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void whenValidFoodInput_thenReturns200() throws Exception {
        FoodLogRequest request = new FoodLogRequest();
        request.setMealType("meat");
        request.setAmount(2.0);
        request.setUnit("servings");
        request.setLogDate(LocalDate.now());

        mockMvc.perform(post("/api/activity-logs/food")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void whenValidShoppingInput_thenReturns200() throws Exception {
        ShoppingLogRequest request = new ShoppingLogRequest();
        request.setProductCategory("clothing");
        request.setSpendAmount(150.0);
        request.setCurrency("USD");
        request.setLogDate(LocalDate.now());

        mockMvc.perform(post("/api/activity-logs/shopping")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
