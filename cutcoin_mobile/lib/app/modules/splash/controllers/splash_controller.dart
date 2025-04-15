import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';
import 'package:cutcoin_mobile/app/routes/app_pages.dart';

class SplashController extends GetxController {
  final StorageService _storageService = Get.find<StorageService>();
  
  @override
  void onInit() {
    super.onInit();
    _checkInitialRoute();
  }
  
  Future<void> _checkInitialRoute() async {
    await Future.delayed(const Duration(seconds: 2)); // Splash screen delay
    
    final isFirstTime = await _storageService.isFirstTime();
    final token = await _storageService.getToken();
    
    if (isFirstTime) {
      Get.offAllNamed(Routes.ONBOARDING);
    } else if (token != null && token.isNotEmpty) {
      Get.offAllNamed(Routes.DASHBOARD);
    } else {
      Get.offAllNamed(Routes.LOGIN);
    }
  }
}
