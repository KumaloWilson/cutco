import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/wallet/controllers/wallet_controller.dart';

class WalletBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(WalletController());
  }
}
