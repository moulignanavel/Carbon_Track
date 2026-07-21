package com.carbontrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryAggregationDto implements Serializable {
    private String category;
    private Double totalEmissions;
}
