package com.mypackage.struktura.repository;

import com.mypackage.struktura.model.entity.ProgramKerja;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgramKerjaRepository extends JpaRepository<ProgramKerja, Long> {
    List<ProgramKerja> findByOrganizationId(Long organizationId);

    
}