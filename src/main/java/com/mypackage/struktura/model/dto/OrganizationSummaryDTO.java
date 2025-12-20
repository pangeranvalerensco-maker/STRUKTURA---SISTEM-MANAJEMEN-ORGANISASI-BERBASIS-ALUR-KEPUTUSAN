package com.mypackage.struktura.model.dto;

public class OrganizationSummaryDTO {
    private Long id;
    private String name;
    private String field;
    private String description;
    private String status;
    private Long memberCount;

    // Constructor harus urut sesuai urutan di SELECT Repository nanti
    public OrganizationSummaryDTO(Long id, String name, String field, String description, String status, Long memberCount) {
        this.id = id;
        this.name = name;
        this.field = field;
        this.description = description;
        this.status = status;
        this.memberCount = memberCount;
    }

    // Getter (Wajib ada!)
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getField() { return field; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public Long getMemberCount() { return memberCount; }
}