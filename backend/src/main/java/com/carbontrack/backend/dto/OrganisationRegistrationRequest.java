package com.carbontrack.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class OrganisationRegistrationRequest {
    @NotBlank private String organisationName;
    @NotBlank private String organisationCode;
    @NotBlank private String organisationType;
    private String industry;
    @NotBlank @Email private String officialEmail;
    private String contactNumber;
    private String address;
    private String city;
    private String state;
    private String country;
    @NotBlank private String adminFullName;
    @NotBlank @Size(min=3, max=50) private String username;
    @NotBlank @Email private String workEmail;
    private String jobTitle;
    @NotBlank @Size(min=8) private String password;

    public String getOrganisationName(){return organisationName;} public void setOrganisationName(String v){organisationName=v;}
    public String getOrganisationCode(){return organisationCode;} public void setOrganisationCode(String v){organisationCode=v;}
    public String getOrganisationType(){return organisationType;} public void setOrganisationType(String v){organisationType=v;}
    public String getIndustry(){return industry;} public void setIndustry(String v){industry=v;}
    public String getOfficialEmail(){return officialEmail;} public void setOfficialEmail(String v){officialEmail=v;}
    public String getContactNumber(){return contactNumber;} public void setContactNumber(String v){contactNumber=v;}
    public String getAddress(){return address;} public void setAddress(String v){address=v;}
    public String getCity(){return city;} public void setCity(String v){city=v;}
    public String getState(){return state;} public void setState(String v){state=v;}
    public String getCountry(){return country;} public void setCountry(String v){country=v;}
    public String getAdminFullName(){return adminFullName;} public void setAdminFullName(String v){adminFullName=v;}
    public String getUsername(){return username;} public void setUsername(String v){username=v;}
    public String getWorkEmail(){return workEmail;} public void setWorkEmail(String v){workEmail=v;}
    public String getJobTitle(){return jobTitle;} public void setJobTitle(String v){jobTitle=v;}
    public String getPassword(){return password;} public void setPassword(String v){password=v;}
}
