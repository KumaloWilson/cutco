import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/dashboard/controllers/dashboard_controller.dart';
import 'package:cutcoin_mobile/app/modules/home/controllers/home_controller.dart';
import 'package:cutcoin_mobile/app/modules/wallet/controllers/wallet_controller.dart';
import 'package:cutcoin_mobile/app/modules/transactions/controllers/transactions_controller.dart';
import 'package:cutcoin_mobile/app/modules/profile/controllers/profile_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(DashboardController());
    Get.put(HomeController());
    Get.put(WalletController());
    Get.put(TransactionsController());
    Get.put(ProfileController());
  }
}
