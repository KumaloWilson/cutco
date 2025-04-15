import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:cutcoin_mobile/app/modules/home/controllers/home_controller.dart';
import 'package:cutcoin_mobile/app/core/theme/app_colors.dart';
import 'package:cutcoin_mobile/app/routes/app_pages.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: controller.refreshData,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header with greeting and profile
                    _buildHeader(),
                    const SizedBox(height: 24),

                    // Wallet balance card
                    _buildWalletCard(),
                    const SizedBox(height: 24),

                    // Quick actions
                    _buildQuickActions(),
                    const SizedBox(height: 24),

                    // Pending transactions
                    if (controller.pendingTransactions.isNotEmpty)
                      _buildPendingTransactions(),

                    // Recent transactions
                    _buildRecentTransactions(),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Welcome back,',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.grey,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              controller.userName.value.split(' ').first,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        CircleAvatar(
          backgroundColor: AppColors.primary,
          radius: 24,
          child: Text(
            controller.userName.value.isNotEmpty
                ? controller.userName.value.substring(0, 1).toUpperCase()
                : 'U',
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildWalletCard() {
    final currencyFormat = NumberFormat.currency(
      symbol: 'CUT ',
      decimalDigits: 2,
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, Color(0xFF8A80FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Your Balance',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            currencyFormat.format(controller.wallet.value?.balance ?? 0),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Text(
                'Wallet Address:',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  controller.wallet.value?.walletAddress ?? 'N/A',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.copy, color: Colors.white, size: 16),
                onPressed: () {
                  // Copy wallet address to clipboard
                },
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Quick Actions',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildActionButton(
              icon: Icons.arrow_upward,
              label: 'Send',
              color: AppColors.primary,
              onTap: () {
                // Navigate to send/transfer screen
              },
            ),
            _buildActionButton(
              icon: Icons.arrow_downward,
              label: 'Receive',
              color: AppColors.success,
              onTap: () {
                // Navigate to receive screen
              },
            ),
            _buildActionButton(
              icon: Icons.add,
              label: 'Deposit',
              color: AppColors.info,
              onTap: () {
                // Navigate to deposit screen
              },
            ),
            _buildActionButton(
              icon: Icons.money_off,
              label: 'Withdraw',
              color: AppColors.warning,
              onTap: () {
                // Navigate to withdraw screen
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: color,
              size: 24,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingTransactions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Pending Transactions',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: controller.pendingTransactions.length,
          itemBuilder: (context, index) {
            final transaction = controller.pendingTransactions[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          transaction['type'].toString().toUpperCase(),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: transaction['type'] == 'deposit'
                                ? AppColors.success
                                : AppColors.warning,
                          ),
                        ),
                        Text(
                          'CUT ${transaction['amount']}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      transaction['description'] ?? 'No description',
                      style: const TextStyle(
                        color: AppColors.grey,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Ref: ${transaction['reference']}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.grey,
                          ),
                        ),
                        TextButton(
                          onPressed: () => controller.cancelTransaction(transaction['reference']),
                          child: const Text('Cancel'),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.error,
                            padding: EdgeInsets.zero,
                            minimumSize: const Size(50, 30),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildRecentTransactions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Recent Transactions',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {
                // Navigate to transactions tab
                Get.toNamed(Routes.TRANSACTIONS);
              },
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        controller.recentTransactions.isEmpty
            ? const Center(
          child: Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'No transactions yet',
              style: TextStyle(color: AppColors.grey),
            ),
          ),
        )
            : ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: controller.recentTransactions.length,
          itemBuilder: (context, index) {
            final transaction = controller.recentTransactions[index];
            return ListTile(
              contentPadding: const EdgeInsets.symmetric(vertical: 8),
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: _getTransactionColor(transaction.type).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _getTransactionIcon(transaction.type),
                  color: _getTransactionColor(transaction.type),
                ),
              ),
              title: Text(
                transaction.description,
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                DateFormat('MMM dd, yyyy').format(transaction.createdAt),
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.grey,
                ),
              ),
              trailing: Text(
                '${transaction.amount > 0 ? '+' : ''}CUT ${transaction.amount.toStringAsFixed(2)}',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: transaction.amount > 0 ? AppColors.success : AppColors.error,
                ),
              ),
              onTap: () {
                // Navigate to transaction details
              },
            );
          },
        ),
      ],
    );
  }

  Color _getTransactionColor(String type) {
    switch (type) {
      case 'deposit':
        return AppColors.success;
      case 'withdrawal':
        return AppColors.warning;
      case 'transfer':
        return AppColors.primary;
      case 'payment':
        return AppColors.info;
      default:
        return AppColors.grey;
    }
  }

  IconData _getTransactionIcon(String type) {
    switch (type) {
      case 'deposit':
        return Icons.arrow_downward;
      case 'withdrawal':
        return Icons.arrow_upward;
      case 'transfer':
        return Icons.swap_horiz;
      case 'payment':
        return Icons.payment;
      default:
        return Icons.swap_horiz;
    }
  }
}
