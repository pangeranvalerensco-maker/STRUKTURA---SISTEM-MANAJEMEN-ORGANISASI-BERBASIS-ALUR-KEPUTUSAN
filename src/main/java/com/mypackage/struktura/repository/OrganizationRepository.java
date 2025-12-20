package com.mypackage.struktura.repository;

import com.mypackage.struktura.model.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Sort;
import java.util.List;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    // Kembali ke fungsi pencarian standar Anda
    List<Organization> findByStatusIgnoreCase(String status, Sort sort); 

    @Query("SELECT o FROM Organization o WHERE o.status = :status AND (LOWER(o.name) LIKE :keyword OR LOWER(o.description) LIKE :keyword)")
    List<Organization> searchActiveByNameOrDescription(
        @Param("keyword") String keyword, 
        @Param("status") String status, 
        Sort sort
    );
}