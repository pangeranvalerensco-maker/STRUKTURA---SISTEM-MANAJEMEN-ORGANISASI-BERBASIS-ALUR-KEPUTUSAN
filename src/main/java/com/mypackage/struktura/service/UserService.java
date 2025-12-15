package com.mypackage.struktura.service;

import com.mypackage.struktura.model.entity.User;

import java.util.List;

public interface UserService {

    User registerUser(User user);

    User requestJoinOrganization(Long userId, Long organizationId);

    List<User> getUsersByOrganization(Long organizationId);

    User approveUser(Long approverId, Long targetUserId);

    List<User> getPendingMembers(Long organizationId);

    List<User> getActiveMembers(Long organizationId);

    User rejectUser(Long approverId, Long targetUserId);

    User login(String email, String password);
}
