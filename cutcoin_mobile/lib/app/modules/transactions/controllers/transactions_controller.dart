import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/data/repositories/transaction_repository.dart';
import 'package:cutcoin_mobile/app/data/models/transaction_model.dart';

class TransactionsController extends GetxController {
  final TransactionRepository _transactionRepository = Get.find<TransactionRepository>();
  
  final transactions = <Transaction>[].obs;
  final filteredTransactions = <Transaction>[].obs;
  final isLoading = true.obs;
  final isRefreshing = false.obs;
  
  final currentPage = 1.obs;
  final totalPages = 1.obs;
  final selectedFilter = 'all'.obs;
  
  @override
  void onInit() {
    super.onInit();
    fetchTransactions();
  }
  
  Future<void> fetchTransactions({int page = 1, String? type}) async {
    try {
      isLoading.value = true;
      
      final result = await _transactionRepository.getTransactionHistory(
        page: page,
        limit: 20,
        type: type == 'all' ? null : type,
      );
      
      transactions.assignAll(result['transactions'] as List<Transaction>);
      filteredTransactions.assignAll(transactions);
      
      currentPage.value = page;
      totalPages.value = result['pagination']['pages'];
      
      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
      Get.snackbar(
        'Error',
        'Failed to load transactions: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
  
  Future<void> refreshTransactions() async {
    try {
      isRefreshing.value = true;
      await fetchTransactions(type: selectedFilter.value == 'all' ? null : selectedFilter.value);
      isRefreshing.value = false;
    } catch (e) {
      isRefreshing.value = false;
    }
  }
  
  void filterTransactions(String filter) {
    selectedFilter.value = filter;
    
    if (filter == 'all') {
      filteredTransactions.assignAll(transactions);
    } else {
      filteredTransactions.assignAll(
        transactions.where((tx) => tx.type == filter).toList(),
      );
    }
  }
  
  Future<void> loadNextPage() async {
    if (currentPage.value < totalPages.value) {
      await fetchTransactions(
        page: currentPage.value + 1,
        type: selectedFilter.value == 'all' ? null : selectedFilter.value,
      );
    }
  }
  
  Future<Transaction> getTransactionDetails(int transactionId) async {
    return await _transactionRepository.getTransactionDetails(transactionId);
  }
}
