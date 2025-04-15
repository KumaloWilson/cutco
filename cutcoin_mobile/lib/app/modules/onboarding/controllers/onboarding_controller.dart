import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';
import 'package:cutcoin_mobile/app/routes/app_pages.dart';

class OnboardingController extends GetxController {
  final StorageService _storageService = Get.find<StorageService>();
  final pageController = PageController();
  final currentPage = 0.obs;
  
  final List<Map<String, String>> onboardingData = [
    {
      'title': 'Welcome to CUTcoin',
      'description': 'Your digital wallet for campus transactions. Fast, secure, and convenient.',
      'image': 'assets/images/onboarding1.png',
    },
    {
      'title': 'Easy Payments',
      'description': 'Pay for services, transfer to friends, and make purchases across campus with ease.',
      'image': 'assets/images/onboarding2.png',
    },
    {
      'title': 'Secure Transactions',
      'description': 'All your transactions are secure with OTP verification and real-time tracking.',
      'image': 'assets/images/onboarding3.png',
    },
  ];
  
  void nextPage() {
    if (currentPage.value < onboardingData.length - 1) {
      pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      completeOnboarding();
    }
  }
  
  void onPageChanged(int page) {
    currentPage.value = page;
  }
  
  Future<void> completeOnboarding() async {
    await _storageService.setFirstTime(false);
    Get.offAllNamed(Routes.LOGIN);
  }
  
  void skip() {
    completeOnboarding();
  }
}
