import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/splash/controllers/splash_controller.dart';

import '../../auth/controllers/auth_controller.dart';

class SplashBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(AuthController());
    Get.put(SplashController());
  }
}
