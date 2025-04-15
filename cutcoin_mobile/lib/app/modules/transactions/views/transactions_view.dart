import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:cutcoin_mobile/app/modules/transactions/controllers/transactions_controller.dart';
import 'package:cutcoin_mobile/app/core/theme/app_colors.dart';

import '../../../data/models/transaction_model.dart';

class TransactionsView extends GetView<TransactionsController> {
  const TransactionsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: controller.refreshTransactions,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          _buildFilterChips(),

          // Transactions list
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }

              if (controller.filteredTransactions.isEmpty) {
                return const Center(
                  child: Text(
                    'No transactions found',
                    style: TextStyle(color: AppColors.grey),
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: controller.refreshTransactions,
                child: ListView.builder(
                  itemCount: controller.filteredTransactions.length,
                  itemBuilder: (context, index) {
                    final transaction = controller.filteredTransactions[index];

                    // Load more when reaching the end
                    if (index == controller.filteredTransactions.length - 1) {
                      controller.loadNextPage();
                    }

                    return _buildTransactionItem(transaction);
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            _buildFilterChip('all', 'All'),
            _buildFilterChip('deposit', 'Deposits'),
            _buildFilterChip('withdrawal', 'Withdrawals'),
            _buildFilterChip('transfer', 'Transfers'),
            _buildFilterChip('payment', 'Payments'),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    return Obx(() {
      final isSelected = controller.selectedFilter.value == value;

      return Padding(
        padding: const EdgeInsets.only(right: 8),
        child: FilterChip(
          label: Text(label),
          selected: isSelected,
          onSelected: (selected) {
            if (selected) {
              controller.filterTransactions(value);
            }
          },
          backgroundColor: AppColors.lightGrey,
          selectedColor: AppColors.primary.withOpacity(0.2),
          checkmarkColor: AppColors.primary,
          labelStyle: TextStyle(
            color: isSelected ? AppColors.primary : AppColors.dark,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      );
    });
  }

  Widget _buildTransactionItem(Transaction transaction) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: _getTransactionColor(transaction).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            _getTransactionIcon(transaction),
            color: _getTransactionColor(transaction),
          ),
        ),
        title: Text(
          transaction.description,
          style: const TextStyle(
            fontWeight: FontWeight.w500,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              DateFormat('MMM dd, yyyy - HH:mm').format(transaction.createdAt),
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.grey,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Ref: ${transaction.reference}',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.grey,
              ),
            ),
          ],
        ),
        trailing: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '${transaction.amount > 0 ? '+' : ''}CUT ${transaction.amount.toStringAsFixed(2)}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: transaction.amount > 0 ? AppColors.success : AppColors.error,
              ),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _getStatusColor(transaction.status).withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                transaction.status.toUpperCase(),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: _getStatusColor(transaction.status),
                ),
              ),
            ),
          ],
        ),
        onTap: () => _showTransactionDetails(transaction),
      ),
    );
  }

  Color _getTransactionColor(Transaction transaction) {
    switch (transaction.type) {
      case 'deposit':
        return AppColors.success;
      case 'withdrawal':
        return AppColors.warning;
      case 'transfer':
        return transaction.amount > 0 ? AppColors.success : AppColors.error;
      case 'payment':
        return AppColors.info;
      default:
        return AppColors.grey;
    }
  }

  IconData _getTransactionIcon(Transaction transaction) {
    switch (transaction.type) {
      case 'deposit':
        return Icons.arrow_downward;
      case 'withdrawal':
        return Icons.arrow_upward;
      case 'transfer':
        return transaction.amount > 0 ? Icons.arrow_downward : Icons.arrow_upward;
      case 'payment':
        return Icons.payment;
      default:
        return Icons.swap_horiz;
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'completed':
        return AppColors.success;
      case 'pending':
        return AppColors.warning;
      case 'failed':
        return AppColors.error;
      case 'cancelled':
        return AppColors.grey;
      default:
        return AppColors.grey;
    }
  }

  void _showTransactionDetails(Transaction transaction) {
    Get.dialog(
      AlertDialog(
        title: const Text('Transaction Details'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('Type', transaction.type.toUpperCase()),
            _buildDetailRow('Amount', 'CUT ${transaction.amount.toStringAsFixed(2)}'),
            if (transaction.fee > 0)
              _buildDetailRow('Fee', 'CUT ${transaction.fee.toStringAsFixed(2)}'),
            _buildDetailRow('Status', transaction.status.toUpperCase()),
            _buildDetailRow('Date', DateFormat('MMM dd, yyyy - HH:mm').format(transaction.createdAt)),
            _buildDetailRow('Reference', transaction.reference),
            _buildDetailRow('Description', transaction.description),
            if (transaction.sender != null)
              _buildDetailRow('From', '${transaction.sender!['name']} (${transaction.sender!['studentId']})'),
            if (transaction.receiver != null)
              _buildDetailRow('To', '${transaction.receiver!['name']} (${transaction.receiver!['studentId']})'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
