import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/transactions/controllers/transactions_controller.dart';

class TransactionsBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(TransactionsController());
  }
}
