package com.carbontrack.backend.dto;

public class ChallengeResponse {

    private Long    id;
    private String  title;
    private String  description;
    private String  category;
    private String  metricType;
    private Double  targetValue;
    private Integer xpReward;
    private String  iconKey;
    private String  period;

    // User-specific fields (null if not joined)
    private String  status;        // NOT_JOINED | IN_PROGRESS | COMPLETED
    private Double  progressValue;
    private Double  progressPct;
    private String  joinedAt;
    private String  completedAt;

    public ChallengeResponse() {}

    // Getters and setters
    public Long    getId()            { return id; }
    public void    setId(Long id)     { this.id = id; }

    public String  getTitle()         { return title; }
    public void    setTitle(String t) { this.title = t; }

    public String  getDescription()              { return description; }
    public void    setDescription(String d)      { this.description = d; }

    public String  getCategory()                 { return category; }
    public void    setCategory(String c)         { this.category = c; }

    public String  getMetricType()               { return metricType; }
    public void    setMetricType(String m)       { this.metricType = m; }

    public Double  getTargetValue()              { return targetValue; }
    public void    setTargetValue(Double t)      { this.targetValue = t; }

    public Integer getXpReward()                 { return xpReward; }
    public void    setXpReward(Integer x)        { this.xpReward = x; }

    public String  getIconKey()                  { return iconKey; }
    public void    setIconKey(String i)          { this.iconKey = i; }

    public String  getPeriod()                   { return period; }
    public void    setPeriod(String p)           { this.period = p; }

    public String  getStatus()                   { return status; }
    public void    setStatus(String s)           { this.status = s; }

    public Double  getProgressValue()            { return progressValue; }
    public void    setProgressValue(Double p)    { this.progressValue = p; }

    public Double  getProgressPct()              { return progressPct; }
    public void    setProgressPct(Double p)      { this.progressPct = p; }

    public String  getJoinedAt()                 { return joinedAt; }
    public void    setJoinedAt(String j)         { this.joinedAt = j; }

    public String  getCompletedAt()              { return completedAt; }
    public void    setCompletedAt(String c)      { this.completedAt = c; }
}
