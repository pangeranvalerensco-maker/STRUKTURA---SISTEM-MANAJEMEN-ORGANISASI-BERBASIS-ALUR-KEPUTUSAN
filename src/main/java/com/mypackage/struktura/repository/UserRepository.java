package com.mypackage.struktura.repository;

import com.mypackage.struktura.model.entity.MemberStatus;
import com.mypackage.struktura.model.entity.User;
import com.mypackage.struktura.model.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByMemberStatus(String memberStatus);

    List<User> findByOrganizationId(Long organizationId);

    List<User> findByOrganizationIdAndMemberStatus(
            Long organizationId,
            MemberStatus memberStatus);

    Optional<User> findById(Long id);

    User getUserById(Long id);

    List<User> findByOrganizationIdAndRole(Long organizationId, Role role);

    // Mencari user berdasarkan nama atau email (Ignore Case = tidak peduli huruf besar/kecil)
    List<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

}
