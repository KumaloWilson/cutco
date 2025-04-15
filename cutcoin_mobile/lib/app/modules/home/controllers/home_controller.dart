import 'package:get/get.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:cutcoin_mobile/app/data/repositories/wallet_repository.dart';
import 'package:cutcoin_mobile/app/data/repositories/transaction_repository.dart';
import 'package:cutcoin_mobile/app/data/models/wallet_model.dart';
import 'package:cutcoin_mobile/app/data/models/transaction_model.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';

class HomeController extends GetxController {
  final WalletRepository _walletRepository = Get.find<WalletRepository>();
  final TransactionRepository _transactionRepository = Get.find<TransactionRepository>();
  final StorageService _storageService = Get.find<StorageService>();
  
  final wallet = Rx<Wallet?>(null);
  final recentTransactions = <Transaction>[].obs;
  final pendingTransactions = <Map<String, dynamic>>[].obs;
  final userName = ''.obs;
  
  final isLoading = true.obs;
  final isRefreshing = false.obs;
  
  @override
  void onInit() {
    super.onInit();
    loadUserName();
    fetchData();
  }
  
  Future<void> loadUserName() async {
    final name = await _storageService.getUserName();
    if (name != null) {
      userName.value = name;
    }
  }
  
  Future<void> fetchData() async {
    try {
      isLoading.value = true;
      
      // Fetch wallet balance
      wallet.value = await _walletRepository.getWalletBalance();
      
      // Fetch recent transactions
      final transactionsData = await _transactionRepository.getTransactionHistory(limit: 5);
      recentTransactions.assignAll(transactionsData['transactions'] as List<Transaction>);
      
      // Fetch pending transactions
      final pendingData = await _walletRepository.getPendingTransactions();
      pendingTransactions.assignAll(pendingData['pendingTransactions'] as List<Map<String, dynamic>>);
      
      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
      Get.snackbar(
        'Error',
        'Failed to load data: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
  
  Future<void> refreshData() async {
    try {
      isRefreshing.value = true;
      await fetchData();
      isRefreshing.value = false;
    } catch (e) {
      isRefreshing.value = false;
    }
  }
  
  Future<void> cancelTransaction(String reference) async {
    try {
      EasyLoading.show(status: 'Cancelling...');
      await _walletRepository.cancelTransaction(reference);
      EasyLoading.dismiss();
      
      Get.snackbar(
        'Success',
        'Transaction cancelled successfully',
        snackPosition: SnackPosition.BOTTOM,
      );
      
      // Refresh data
      await fetchData();
    } catch (e) {
      EasyLoading.dismiss();
      Get.snackbar(
        'Error',
        'Failed to cancel transaction: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
}
