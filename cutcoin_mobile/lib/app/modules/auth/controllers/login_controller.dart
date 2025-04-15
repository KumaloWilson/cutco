import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:cutcoin_mobile/app/data/repositories/auth_repository.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';
import 'package:cutcoin_mobile/app/routes/app_pages.dart';

class LoginController extends GetxController {
  final AuthRepository _authRepository = Get.find<AuthRepository>();
  final StorageService _storageService = Get.find<StorageService>();
  
  final studentIdController = TextEditingController();
  final pinController = TextEditingController();
  
  final isLoading = false.obs;
  final obscurePin = true.obs;
  
  void togglePinVisibility() {
    obscurePin.value = !obscurePin.value;
  }
  
  Future<void> login() async {
    if (studentIdController.text.isEmpty || pinController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter your student ID and PIN',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }
    
    try {
      isLoading.value = true;
      EasyLoading.show(status: 'Logging in...');
      
      final response = await _authRepository.login(
        studentIdController.text.trim(),
        pinController.text.trim(),
      );
      
      // Save student ID for OTP verification
      await _storageService.saveStudentId(studentIdController.text.trim());
      
      EasyLoading.dismiss();
      isLoading.value = false;
      
      // Navigate to OTP verification
      Get.toNamed(Routes.VERIFY_OTP, arguments: {
        'purpose': 'login',
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
  
  void goToRegister() {
    Get.toNamed(Routes.REGISTER);
  }
  
  void goToForgotPin() {
    // Navigate to forgot PIN screen
  }
}
