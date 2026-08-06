package com.carbontrack.backend.service;

import com.carbontrack.backend.dto.ActivityLogRequest;
import com.carbontrack.backend.entity.ActivityLog;
import com.carbontrack.backend.entity.EmissionFactor;
import com.carbontrack.backend.entity.User;
import com.carbontrack.backend.repository.ActivityLogRepository;
import com.carbontrack.backend.repository.EmissionFactorRepository;
import com.carbontrack.backend.service.impl.ActivityLoggingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.springframework.context.ApplicationEventPublisher;

class EmissionFactorServiceTest {

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private EmissionFactorRepository emissionFactorRepository;

    @Mock
    private SecurityService securityService;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private ActivityLoggingServiceImpl activityLoggingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@example.com");
        
        when(securityService.getCurrentUser()).thenReturn(mockUser);
        
        when(activityLogRepository.save(any(ActivityLog.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @ParameterizedTest
    @CsvSource({
        "transport, car, 10.0, km, 0.21, 2.1",
        "transport, flight, 100.0, km, 0.15, 15.0",
        "electricity, grid, 50.0, kWh, 0.45, 22.5",
        "food, meat, 2.0, serving, 3.0, 6.0",
        "shopping, clothing, 150.0, USD, 0.4, 60.0",
        "transport, car, 0.0, km, 0.21, 0.0",
        "transport, car, 999999.0, km, 0.21, 209999.79"
    })
    void testEmissionCalculations(String category, String activityType, double quantity, String unit, double factorVal, double expectedEmissions) {
        EmissionFactor ef = new EmissionFactor();
        ef.setActivityType(activityType);
        ef.setUnit(unit);
        ef.setKgCo2ePerUnit(factorVal);
        ef.setEffectiveDate(LocalDate.now());

        when(emissionFactorRepository.findFirstByActivityTypeAndUnitOrderByEffectiveDateDesc(activityType, unit))
                .thenReturn(Optional.of(ef));

        ActivityLogRequest request = new ActivityLogRequest(category, activityType, quantity, unit, LocalDate.now());

        ActivityLog result = activityLoggingService.logActivity(request);

        assertNotNull(result);
        assertEquals(expectedEmissions, result.getCalculatedEmissions(), 0.001);
    }

    @Test
    void testUnknownActivityTypeUsesFallbackFactor() {
        when(emissionFactorRepository.findFirstByActivityTypeAndUnitOrderByEffectiveDateDesc("spaceshuttle", "km"))
                .thenReturn(Optional.empty());

        ActivityLogRequest request = new ActivityLogRequest("transport", "spaceshuttle", 10.0, "km", LocalDate.now());

        ActivityLog result = activityLoggingService.logActivity(request);
        assertNotNull(result);
        assertEquals(10.0, result.getCalculatedEmissions(), 0.001);
    }
}
