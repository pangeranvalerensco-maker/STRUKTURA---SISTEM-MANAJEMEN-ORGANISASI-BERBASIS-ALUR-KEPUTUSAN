package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.User;
import org.springframework.data.domain.Page;

import java.util.List;

public interface UserService {

    User getUserById(Long id);

    User registerUser(User user);

    User requestJoinOrganization(Long userId, Long organizationId, String reason);

    List<User> getUsersByOrganization(Long organizationId);

    User approveUser(Long approverId, Long targetUserId);

    List<User> getPendingMembers(Long organizationId);

    List<User> getActiveMembers(Long organizationId);

    User rejectUser(Long approverId, Long targetUserId);

    User login(String email, String password);

    User assignPimpinan(Long adminId, Long targetUserId, Long organizationId);

    Page<User> searchAndSortActiveMembers(Long organizationId, String keyword, int page, int size, String sortBy, String sortDirection);

    User updateUser(Long id, User userDetails);

    User updateMemberPosition(Long pimpinanId, Long targetUserId, String newPosition); // 🛑 METHOD BARU

    User updateMemberNumber(Long pimpinanId, Long targetUserId, String memberNumber); // 🛑 METHOD BARU

    void revokeMembership(Long userId, String Reason); // 🛑 METHOD BARU

    User resetUserStatus(Long userId);

    void requestResignation(Long userId, String reason);

    User processResignation(Long pimpinanId, Long targetUserId, String action);

    void deleteUser(Long userId);
}
