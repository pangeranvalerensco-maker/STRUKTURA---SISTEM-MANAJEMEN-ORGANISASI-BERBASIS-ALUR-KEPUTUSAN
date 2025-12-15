package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface UserService {

    User getUserById(Long id);

    User registerUser(User user);

    User requestJoinOrganization(Long userId, Long organizationId);

    List<User> getUsersByOrganization(Long organizationId);

    User approveUser(Long approverId, Long targetUserId);

    List<User> getPendingMembers(Long organizationId);

    List<User> getActiveMembers(Long organizationId);

    User rejectUser(Long approverId, Long targetUserId);

    User login(String email, String password);

    User assignPimpinan(Long adminId, Long targetUserId, Long organizationId);

    Page<User> searchAndSortActiveMembers(Long organizationId, String keyword, int page, int size, String sortBy, String sortDirection);
}
