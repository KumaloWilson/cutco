import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:cutcoin_mobile/app/data/repositories/auth_repository.dart';
import 'package:cutcoin_mobile/app/routes/app_pages.dart';

class RegisterController extends GetxController {
  final AuthRepository _authRepository = Get.find<AuthRepository>();
  
  final studentIdController = TextEditingController();
  final firstNameController = TextEditingController();
  final lastNameController = TextEditingController();
  final phoneNumberController = TextEditingController();
  final pinController = TextEditingController();
  final confirmPinController = TextEditingController();
  
  final isLoading = false.obs;
  final obscurePin = true.obs;
  final obscureConfirmPin = true.obs;
  
  void togglePinVisibility() {
    obscurePin.value = !obscurePin.value;
  }
  
  void toggleConfirmPinVisibility() {
    obscureConfirmPin.value = !obscureConfirmPin.value;
  }
  
  Future<void> register() async {
    // Validate inputs
    if (studentIdController.text.isEmpty ||
        firstNameController.text.isEmpty ||
        lastNameController.text.isEmpty ||
        phoneNumberController.text.isEmpty ||
        pinController.text.isEmpty ||
        confirmPinController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please fill in all fields',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }
    
    if (pinController.text != confirmPinController.text) {
      Get.snackbar(
        'Error',
        'PINs do not match',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }
    
    if (pinController.text.length < 4) {
      Get.snackbar(
        'Error',
        'PIN must be at least 4 digits',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }
    
    try {
      isLoading.value = true;
      EasyLoading.show(status: 'Registering...');
      
      final userData = {
        'studentId': studentIdController.text.trim(),
        'firstName': firstNameController.text.trim(),
        'lastName': lastNameController.text.trim(),
        'phoneNumber': phoneNumberController.text.trim(),
        'pin': pinController.text.trim(),
      };
      
      final response = await _authRepository.register(userData);
      
      EasyLoading.dismiss();
      isLoading.value = false;
      
      // Navigate to OTP verification
      Get.toNamed(Routes.VERIFY_OTP, arguments: {
        'purpose': 'registration',
        'phoneNumber': phoneNumberController.text.trim(),
        'userId': response['userId'],
      });
    } catch (e) {
      EasyLoading.dismiss();
      isLoading.value = false;
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }
  }
  
  void goToLogin() {
    Get.back();
  }
}
