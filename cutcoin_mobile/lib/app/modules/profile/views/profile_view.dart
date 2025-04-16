import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/profile/controllers/profile_controller.dart';
import 'package:cutcoin_mobile/app/core/theme/app_colors.dart';

class ProfileView extends GetView<ProfileController> {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          Obx(() {
            if (controller.isEditing.value) {
              return IconButton(
                icon: const Icon(Icons.close),
                onPressed: controller.toggleEditMode,
              );
            } else {
              return IconButton(
                icon: const Icon(Icons.edit),
                onPressed: controller.toggleEditMode,
              );
            }
          }),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }

        return RefreshIndicator(
          onRefresh: controller.refreshUserProfile,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile header with avatar
                  _buildProfileHeader(),
                  const SizedBox(height: 32),

                  // Profile information
                  controller.isEditing.value
                      ? _buildEditForm()
                      : _buildProfileInfo(),
                  const SizedBox(height: 32),

                  // Action buttons
                  _buildActionButtons(),
                ],
              ),
            ),
          ),
        );
      }),
      // Only show save button when editing
      floatingActionButton: Obx(() {
        if (controller.isEditing.value) {
          return FloatingActionButton(
            onPressed: controller.updateProfile,
            backgroundColor: AppColors.primary,
            child: const Icon(Icons.save),
          );
        } else {
          return const SizedBox.shrink();
        }
      }),
    );
  }

  Widget _buildProfileHeader() {
    return Center(
      child: Column(
        children: [
          Obx(() {
            if (controller.isEditing.value) {
              return Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppColors.primary,
                    backgroundImage: controller.profileImage.value != null
                        ? FileImage(controller.profileImage.value!)
                        : null,
                    child: controller.profileImage.value == null
                        ? Text(
                      controller.user.value?.firstName.substring(0, 1).toUpperCase() ?? 'U',
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    )
                        : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.camera_alt, color: Colors.white),
                        onPressed: controller.pickImage,
                        constraints: const BoxConstraints.tightFor(width: 32, height: 32),
                        padding: EdgeInsets.zero,
                      ),
                    ),
                  ),
                ],
              );
            } else {
              return CircleAvatar(
                radius: 50,
                backgroundColor: AppColors.primary,
                child: Text(
                  controller.user.value?.firstName.substring(0, 1).toUpperCase() ?? 'U',
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              );
            }
          }),
          const SizedBox(height: 16),
          Text(
            '${controller.user.value?.firstName} ${controller.user.value?.lastName}',
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            controller.user.value?.studentId ?? '',
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProfileInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Personal Information',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        _buildInfoCard(
          icon: Icons.person,
          title: 'Full Name',
          value: '${controller.user.value?.firstName} ${controller.user.value?.lastName}',
        ),
        _buildInfoCard(
          icon: Icons.badge,
          title: 'Student ID',
          value: controller.user.value?.studentId ?? '',
        ),
        _buildInfoCard(
          icon: Icons.phone,
          title: 'Phone Number',
          value: controller.user.value?.phoneNumber ?? '',
        ),
        _buildInfoCard(
          icon: Icons.email,
          title: 'Email',
          value: controller.user.value?.email ?? 'Not set',
        ),
      ],
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.grey,
          ),
        ),
        subtitle: Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildEditForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Edit Profile',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: controller.firstNameController,
          decoration: const InputDecoration(
            labelText: 'First Name',
            prefixIcon: Icon(Icons.person),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: controller.lastNameController,
          decoration: const InputDecoration(
            labelText: 'Last Name',
            prefixIcon: Icon(Icons.person),
          ),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: controller.phoneNumberController,
          decoration: const InputDecoration(
            labelText: 'Phone Number',
            prefixIcon: Icon(Icons.phone),
          ),
          keyboardType: TextInputType.phone,
        ),
        const SizedBox(height: 16),
        TextField(
          controller: controller.emailController,
          decoration: const InputDecoration(
            labelText: 'Email (Optional)',
            prefixIcon: Icon(Icons.email),
          ),
          keyboardType: TextInputType.emailAddress,
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Security',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ListTile(
          leading: const Icon(Icons.lock, color: AppColors.primary),
          title: const Text('Change PIN'),
          trailing: const Icon(Icons.arrow_forward_ios),
          onTap: controller.changePin,
        ),
        const Divider(),
        ListTile(
          leading: const Icon(Icons.logout, color: Colors.red),
          title: const Text('Logout'),
          onTap: controller.logout,
        ),
      ],
    );
  }
}
