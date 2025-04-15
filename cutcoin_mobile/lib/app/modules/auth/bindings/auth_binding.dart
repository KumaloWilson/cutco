import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/auth/controllers/auth_controller.dart';
import 'package:cutcoin_mobile/app/modules/auth/controllers/login_controller.dart';
import 'package:cutcoin_mobile/app/modules/auth/controllers/register_controller.dart';
import 'package:cutcoin_mobile/app/modules/auth/controllers/verify_otp_controller.dart';

class AuthBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(AuthController());
    Get.lazyPut(() => LoginController());
    Get.lazyPut(() => RegisterController());
    Get.lazyPut(() => VerifyOtpController());
  }
}
