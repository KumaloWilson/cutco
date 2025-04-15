import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:cutcoin_mobile/app/data/repositories/user_repository.dart';
import 'package:cutcoin_mobile/app/data/models/user_model.dart';
import 'package:cutcoin_mobile/app/modules/auth/controllers/auth_controller.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class ProfileController extends GetxController {
  final UserRepository _userRepository = Get.find<UserRepository>();
  final AuthController _authController = Get.find<AuthController>();

  final user = Rx<User?>(null);
  final isLoading = true.obs;
  final isRefreshing = false.obs;
  final isEditing = false.obs;

  // Form controllers
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final phoneNumberController = TextEditingController();
  final emailController = TextEditingController();

  // For profile picture
  final profileImage = Rx<File?>(null);
  final ImagePicker _picker = ImagePicker();

  @override
  void onInit() {
    super.onInit();
    fetchUserProfile();
  }

  Future<void> fetchUserProfile() async {
    try {
      isLoading.value = true;
      user.value = await _userRepository.getUserProfile();

      // Set initial values for form controllers
      if (user.value != null) {
        firstNameController.text = user.value!.firstName;
        lastNameController.text = user.value!.lastName;
        phoneNumberController.text = user.value!.phoneNumber;
        emailController.text = user.value!.email ?? '';
      }

      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
      Get.snackbar(
        'Error',
        'Failed to load user profile: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  Future<void> refreshUserProfile() async {
    try {
      isRefreshing.value = true;
      await fetchUserProfile();
      isRefreshing.value = false;
    } catch (e) {
      isRefreshing.value = false;
    }
  }

  void toggleEditMode() {
    isEditing.value = !isEditing.value;

    if (!isEditing.value) {
      // Reset form values if editing is cancelled
      if (user.value != null) {
        firstNameController.text = user.value!.firstName;
        lastNameController.text = user.value!.lastName;
        phoneNumberController.text = user.value!.phoneNumber;
        emailController.text = user.value!.email ?? '';
      }
      profileImage.value = null;
    }
  }

  Future<void> pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      profileImage.value = File(image.path);
    }
  }

  Future<void> updateProfile() async {
    if (firstNameController.text.isEmpty ||
        lastNameController.text.isEmpty ||
        phoneNumberController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please fill in all required fields',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }

    try {
      EasyLoading.show(status: 'Updating profile...');

      final userData = {
        'firstName': firstNameController.text.trim(),
        'lastName': lastNameController.text.trim(),
        'phoneNumber': phoneNumberController.text.trim(),
        'email': emailController.text.trim(),
      };

      // If profile image is selected, upload it
      if (profileImage.value != null) {
        // TODO: Implement profile image upload
      }

      await _userRepository.updateUserProfile(userData);

      // Update the local user data
      await refreshUserProfile();

      // Update username in storage
      final userName = '${firstNameController.text} ${lastNameController.text}';
      await _userRepository.saveUserName(userName);

      EasyLoading.dismiss();

      // Exit edit mode
      isEditing.value = false;

      Get.snackbar(
        'Success',
        'Profile updated successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    } catch (e) {
      EasyLoading.dismiss();
      Get.snackbar(
        'Error',
        'Failed to update profile: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }
  }

  Future<void> logout() async {
    Get.dialog(
      AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              _authController.logout();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  Future<void> changePin() {
    // TODO: Implement change PIN functionality
    return Future.value();
  }

  @override
  void onClose() {
    firstNameController.dispose();
    lastNameController.dispose();
    phoneNumberController.dispose();
    emailController.dispose();
    super.onClose();
  }
}
