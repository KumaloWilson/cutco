import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/profile/controllers/profile_controller.dart';
import 'package:cutcoin_mobile/app/data/repositories/user_repository.dart';

import '../../auth/controllers/auth_controller.dart';

class ProfileBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(AuthController());
    Get.lazyPut<UserRepository>(() => UserRepository(Get.find()));
    Get.lazyPut<ProfileController>(() => ProfileController());
  }
}
