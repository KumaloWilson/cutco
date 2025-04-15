import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:cutcoin_mobile/app/modules/wallet/controllers/wallet_controller.dart';
import 'package:cutcoin_mobile/app/core/theme/app_colors.dart';

class WalletView extends GetView<WalletController> {
  const WalletView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wallet'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: controller.refreshWalletBalance,
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }
        
        return RefreshIndicator(
          onRefresh: controller.refreshWalletBalance,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Wallet balance card
                  _buildWalletCard(),
                  const SizedBox(height: 32),
                  
                  // Action buttons
                  _buildActionButtons(context),
                  const SizedBox(height: 32),
                  
                  // Wallet address
                  _buildWalletAddress(),
                ],
              ),
            ),
          ),
        );
      }),
    );
  }
  
  Widget _buildWalletCard() {
    final currencyFormat = NumberFormat.currency(
      symbol: 'CUT ',
      decimalDigits: 2,
    );
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
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
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            'Current Balance',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            currencyFormat.format(controller.wallet.value?.balance ?? 0),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.lock,
                color: Colors.white70,
                size: 16,
              ),
              SizedBox(width: 8),
              Text(
                'Secured by OTP verification',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
  
  Widget _buildActionButtons(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Actions',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                icon: Icons.arrow_upward,
                label: 'Send',
                color: AppColors.primary,
                onTap: () => _showTransferDialog(context),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildActionButton(
                icon: Icons.arrow_downward,
                label: 'Receive',
                color: AppColors.success,
                onTap: () => _showReceiveDialog(context),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildActionButton(
                icon: Icons.add,
                label: 'Deposit',
                color: AppColors.info,
                onTap: () => _showDepositDialog(context),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildActionButton(
                icon: Icons.money_off,
                label: 'Withdraw',
                color: AppColors.warning,
                onTap: () => _showWithdrawalDialog(context),
              ),
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
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: color,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildWalletAddress() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Wallet Address',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.lightGrey,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  controller.wallet.value?.walletAddress ?? 'N/A',
                  style: const TextStyle(
                    fontSize: 14,
                  ),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.copy, color: AppColors.primary),
                onPressed: () {
                  // Copy wallet address to clipboard
                  Get.snackbar(
                    'Copied',
                    'Wallet address copied to clipboard',
                    snackPosition: SnackPosition.BOTTOM,
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
  
  void _showDepositDialog(BuildContext context) {
    Get.dialog(
      AlertDialog(
        title: const Text('Deposit'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: controller.depositAmountController,
              decoration: const InputDecoration(
                labelText: 'Amount',
                hintText: 'Enter amount',
                prefixIcon: Icon(Icons.attach_money),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: controller.depositMerchantNumberController,
              decoration: const InputDecoration(
                labelText: 'Merchant Number',
                hintText: 'Enter merchant number',
                prefixIcon: Icon(Icons.store),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: controller.initiateDeposit,
            child: const Text('Deposit'),
          ),
        ],
      ),
    );
  }
  
  void _showWithdrawalDialog(BuildContext context) {
    Get.dialog(
      AlertDialog(
        title: const Text('Withdraw'),
        content: Obx(() {
          if (controller.showWithdrawalOtp.value) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Enter the OTP sent to your phone',
                  style: TextStyle(fontSize: 14, color: AppColors.grey),
                ),
                const SizedBox(height: 16),
                PinCodeTextField(
                  appContext: context,
                  length: 6,
                  obscureText: false,
                  animationType: AnimationType.fade,
                  pinTheme: PinTheme(
                    shape: PinCodeFieldShape.box,
                    borderRadius: BorderRadius.circular(8),
                    fieldHeight: 50,
                    fieldWidth: 40,
                    activeFillColor: AppColors.lightGrey,
                    inactiveFillColor: AppColors.lightGrey,
                    selectedFillColor: AppColors.lightGrey,
                    activeColor: AppColors.primary,
                    inactiveColor: AppColors.lightGrey,
                    selectedColor: AppColors.primary,
                  ),
                  animationDuration: const Duration(milliseconds: 300),
                  enableActiveFill: true,
                  controller: controller.withdrawalOtpController,
                  onChanged: (value) {
                    // No need to do anything here
                  },
                ),
              ],
            );
          } else {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: controller.withdrawalAmountController,
                  decoration: const InputDecoration(
                    labelText: 'Amount',
                    hintText: 'Enter amount',
                    prefixIcon: Icon(Icons.attach_money),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller.withdrawalMerchantNumberController,
                  decoration: const InputDecoration(
                    labelText: 'Merchant Number',
                    hintText: 'Enter merchant number',
                    prefixIcon: Icon(Icons.store),
                  ),
                ),
              ],
            );
          }
        }),
        actions: [
          TextButton(
            onPressed: () {
              if (controller.showWithdrawalOtp.value) {
                controller.cancelWithdrawalOtp();
              }
              Get.back();
            },
            child: const Text('Cancel'),
          ),
          Obx(() {
            return ElevatedButton(
              onPressed: controller.showWithdrawalOtp.value
                  ? controller.confirmWithdrawalOtp
                  : controller.initiateWithdrawal,
              child: Text(
                controller.showWithdrawalOtp.value ? 'Confirm' : 'Withdraw',
              ),
            );
          }),
        ],
      ),
    );
  }
  
  void _showTransferDialog(BuildContext context) {
    Get.dialog(
      AlertDialog(
        title: const Text('Send CUTcoins'),
        content: Obx(() {
          if (controller.showTransferOtp.value) {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Enter the OTP sent to your phone',
                  style: TextStyle(fontSize: 14, color: AppColors.grey),
                ),
                const SizedBox(height: 16),
                PinCodeTextField(
                  appContext: context,
                  length: 6,
                  obscureText: false,
                  animationType: AnimationType.fade,
                  pinTheme: PinTheme(
                    shape: PinCodeFieldShape.box,
                    borderRadius: BorderRadius.circular(8),
                    fieldHeight: 50,
                    fieldWidth: 40,
                    activeFillColor: AppColors.lightGrey,
                    inactiveFillColor: AppColors.lightGrey,
                    selectedFillColor: AppColors.lightGrey,
                    activeColor: AppColors.primary,
                    inactiveColor: AppColors.lightGrey,
                    selectedColor: AppColors.primary,
                  ),
                  animationDuration: const Duration(milliseconds: 300),
                  enableActiveFill: true,
                  controller: controller.transferOtpController,
                  onChanged: (value) {
                    // No need to do anything here
                  },
                ),
              ],
            );
          } else {
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: controller.transferRecipientIdController,
                  decoration: const InputDecoration(
                    labelText: 'Recipient Student ID',
                    hintText: 'Enter recipient student ID',
                    prefixIcon: Icon(Icons.person),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller.transferAmountController,
                  decoration: const InputDecoration(
                    labelText: 'Amount',
                    hintText: 'Enter amount',
                    prefixIcon: Icon(Icons.attach_money),
                  ),
                  keyboardType: TextInputType.number,
                ),
              ],
            );
          }
        }),
        actions: [
          TextButton(
            onPressed: () {
              if (controller.showTransferOtp.value) {
                controller.cancelTransferOtp();
              }
              Get.back();
            },
            child: const Text('Cancel'),
          ),
          Obx(() {
            return ElevatedButton(
              onPressed: controller.showTransferOtp.value
                  ? controller.confirmTransferOtp
                  : controller.initiateTransfer,
              child: Text(
                controller.showTransferOtp.value ? 'Confirm' : 'Send',
              ),
            );
          }),
        ],
      ),
    );
  }
  
  void _showReceiveDialog(BuildContext context) {
    Get.dialog(
      AlertDialog(
        title: const Text('Receive CUTcoins'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Share your wallet address or student ID with the sender',
              style: TextStyle(fontSize: 14, color: AppColors.grey),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.lightGrey,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Text(
                    'Your Wallet Address',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    controller.wallet.value?.walletAddress ?? 'N/A',
                    style: const TextStyle(fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      // Copy wallet address to clipboard
                      Get.back();
                      Get.snackbar(
                        'Copied',
                        'Wallet address copied to clipboard',
                        snackPosition: SnackPosition.BOTTOM,
                      );
                    },
                    icon: const Icon(Icons.copy),
                    label: const Text('Copy Address'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
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
}
