import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:cutcoin_mobile/app/data/repositories/auth_repository.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';
import 'package:cutcoin_mobile/app/modules/auth/controllers/auth_controller.dart';
import 'package:cutcoin_mobile/app/routes/app_pages.dart';

class VerifyOtpController extends GetxController {
  final AuthRepository _authRepository = Get.find<AuthRepository>();
  final StorageService _storageService = Get.find<StorageService>();
  final AuthController _authController = Get.find<AuthController>();
  
  final otpController = TextEditingController();
  final isLoading = false.obs;
  
  late String purpose;
  late String phoneNumber;
  late int userId;
  late String studentId;
  
  @override
  void onInit() {
    super.onInit();
    final args = Get.arguments as Map<String, dynamic>;
    purpose = args['purpose'];
    userId = args['userId'];
    
    if (purpose == 'registration') {
      phoneNumber = args['phoneNumber'];
    } else {
      _loadStudentId();
    }
  }
  
  Future<void> _loadStudentId() async {
    studentId = (await _storageService.getStudentId())!;
  }
  
  Future<void> verifyOtp() async {
    if (otpController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter the OTP',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
      return;
    }
    
    try {
      isLoading.value = true;
      EasyLoading.show(status: 'Verifying OTP...');
      
      if (purpose == 'registration') {
        await _verifyRegistrationOtp();
      } else if (purpose == 'login') {
        await _verifyLoginOtp();
      }
      
      EasyLoading.dismiss();
      isLoading.value = false;
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
  
  Future<void> _verifyRegistrationOtp() async {
    await _authRepository.verifyOtp(
      phoneNumber,
      otpController.text.trim(),
      'registration',
    );
    
    Get.snackbar(
      'Success',
      'Registration successful. Please login.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.green,
      colorText: Colors.white,
    );
    
    Get.offAllNamed(Routes.LOGIN);
  }
  
  Future<void> _verifyLoginOtp() async {
    final response = await _authRepository.verifyLoginOtp(
      studentId,
      otpController.text.trim(),
    );
    
    // Save auth data
    await _authController.saveAuthData(response);
    
    Get.offAllNamed(Routes.DASHBOARD);
  }
  
  void resendOtp() {
    // Implement resend OTP functionality
    Get.snackbar(
      'Info',
      'OTP resent to your phone number',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: Colors.blue,
      colorText: Colors.white,
    );
  }
}
