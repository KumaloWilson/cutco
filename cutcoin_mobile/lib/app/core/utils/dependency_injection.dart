import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/core/network/dio_client.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';
import 'package:cutcoin_mobile/app/data/repositories/auth_repository.dart';
import 'package:cutcoin_mobile/app/data/repositories/wallet_repository.dart';
import 'package:cutcoin_mobile/app/data/repositories/transaction_repository.dart';
import 'package:cutcoin_mobile/app/data/repositories/user_repository.dart';
import 'package:cutcoin_mobile/app/data/providers/api_provider.dart';

class DependencyInjection {
  static Future<void> init() async {
    // Core
    await Get.putAsync(() => StorageService().init());
    Get.lazyPut(() => DioClient(), fenix: true);
    
    // Providers
    Get.lazyPut(() => ApiProvider(Get.find<DioClient>()), fenix: true);
    
    // Repositories
    Get.lazyPut(() => AuthRepository(Get.find<ApiProvider>()), fenix: true);
    Get.lazyPut(() => WalletRepository(Get.find<ApiProvider>()), fenix: true);
    Get.lazyPut(() => TransactionRepository(Get.find<ApiProvider>()), fenix: true);
    Get.lazyPut(() => UserRepository(Get.find<ApiProvider>()), fenix: true);
  }
}
