package com.carbontrack.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "organisations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Organisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;
    @Column(unique = true, length = 50) private String code;
    @Column(name="organisation_type", length = 50) private String organisationType;
    private String industry;
    @Column(name="official_email", unique = true, length = 100) private String officialEmail;
    private String contactNumber;
    private String address;
    private String city;
    private String state;
    private String country;
    @Column(name="postal_code", length = 20) private String postalCode;
    private String website;
    @Column(name="carbon_target") private Double carbonTarget;
    @Column(name="logo_url") private String logoUrl;
    @Lob @Column(name="logo_data") private String logoData;
    @Column(name="reporting_year") private Integer reportingYear;
    @Column(name="preferred_unit", length = 20) private String preferredUnit;
    @Column(name="reporting_frequency", length = 30) private String reportingFrequency;

    @Column(name = "admin_user_id")
    private Long adminUserId;

    @Column(nullable = false)
    private boolean active = true;
}
