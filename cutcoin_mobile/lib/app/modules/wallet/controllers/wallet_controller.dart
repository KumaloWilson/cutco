import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import 'package:cutcoin_mobile/app/data/repositories/wallet_repository.dart';
import 'package:cutcoin_mobile/app/data/models/wallet_model.dart';

class WalletController extends GetxController {
  final WalletRepository _walletRepository = Get.find<WalletRepository>();
  
  final wallet = Rx<Wallet?>(null);
  final isLoading = true.obs;
  final isRefreshing = false.obs;
  
  // Controllers for deposit
  final depositAmountController = TextEditingController();
  final depositMerchantNumberController = TextEditingController();
  
  // Controllers for withdrawal
  final withdrawalAmountController = TextEditingController();
  final withdrawalMerchantNumberController = TextEditingController();
  final withdrawalOtpController = TextEditingController();
  
  // Controllers for transfer
  final transferRecipientIdController = TextEditingController();
  final transferAmountController = TextEditingController();
  final transferOtpController = TextEditingController();
  
  // State variables
  final showWithdrawalOtp = false.obs;
  final showTransferOtp = false.obs;
  final withdrawalAmount = 0.0.obs;
  final withdrawalMerchantNumber = ''.obs;
  final transferRecipientId = ''.obs;
  final transferAmount = 0.0.obs;
  
  @override
  void onInit() {
    super.onInit();
    fetchWalletBalance();
  }
  
  Future<void> fetchWalletBalance() async {
    try {
      isLoading.value = true;
      wallet.value = await _walletRepository.getWalletBalance();
      isLoading.value = false;
    } catch (e) {
      isLoading.value = false;
      Get.snackbar(
        'Error',
        'Failed to load wallet balance: ${e.toString()}',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }
  
  Future<void> refreshWalletBalance() async {
    try {
      isRefreshing.value = true;
      await fetchWalletBalance();
      isRefreshing.value = false;
    } catch (e) {
      isRefreshing.value = false;
    }
  }
  
  // Deposit methods
  Future<void> initiateDeposit() async {
    if (depositAmountController.text.isEmpty || depositMerchantNumberController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter amount and merchant number',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    final amount = double.tryParse(depositAmountController.text);
    if (amount == null || amount <= 0) {
      Get.snackbar(
        'Error',
        'Please enter a valid amount',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    try {
      EasyLoading.show(status: 'Initiating deposit...');
      
      final result = await _walletRepository.initiateDeposit(
        amount,
        depositMerchantNumberController.text.trim(),
      );
      
      EasyLoading.dismiss();
      
      Get.back(); // Close the deposit dialog
      
      Get.snackbar(
        'Success',
        result['message'] ?? 'Deposit initiated successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
      
      // Clear controllers
      depositAmountController.clear();
      depositMerchantNumberController.clear();
      
      // Refresh wallet balance
      await refreshWalletBalance();
    } catch (e) {
      EasyLoading.dismiss();
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }
  }
  
  // Withdrawal methods
  Future<void> initiateWithdrawal() async {
    if (withdrawalAmountController.text.isEmpty || withdrawalMerchantNumberController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter amount and merchant number',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    final amount = double.tryParse(withdrawalAmountController.text);
    if (amount == null || amount <= 0) {
      Get.snackbar(
        'Error',
        'Please enter a valid amount',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    try {
      EasyLoading.show(status: 'Initiating withdrawal...');
      
      final result = await _walletRepository.initiateWithdrawal(
        amount,
        withdrawalMerchantNumberController.text.trim(),
      );
      
      EasyLoading.dismiss();
      
      // Store values for OTP confirmation
      withdrawalAmount.value = amount;
      withdrawalMerchantNumber.value = withdrawalMerchantNumberController.text.trim();
      
      // Show OTP input
      showWithdrawalOtp.value = true;
      
      Get.snackbar(
        'Success',
        result['message'] ?? 'OTP sent for withdrawal verification',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    } catch (e) {
      EasyLoading.dismiss();
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }
  }
  
  Future<void> confirmWithdrawalOtp() async {
    if (withdrawalOtpController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter the OTP',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    try {
      EasyLoading.show(status: 'Confirming withdrawal...');
      
      final result = await _walletRepository.confirmWithdrawalOTP(
        withdrawalAmount.value,
        withdrawalMerchantNumber.value,
        withdrawalOtpController.text.trim(),
      );
      
      EasyLoading.dismiss();
      
      Get.back(); // Close the withdrawal dialog
      
      Get.snackbar(
        'Success',
        result['message'] ?? 'Withdrawal initiated successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
      
      // Reset state
      showWithdrawalOtp.value = false;
      withdrawalAmountController.clear();
      withdrawalMerchantNumberController.clear();
      withdrawalOtpController.clear();
      
      // Refresh wallet balance
      await refreshWalletBalance();
    } catch (e) {
      EasyLoading.dismiss();
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }
  }
  
  void cancelWithdrawalOtp() {
    showWithdrawalOtp.value = false;
    withdrawalOtpController.clear();
  }
  
  // Transfer methods
  Future<void> initiateTransfer() async {
    if (transferRecipientIdController.text.isEmpty || transferAmountController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter recipient ID and amount',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    final amount = double.tryParse(transferAmountController.text);
    if (amount == null || amount <= 0) {
      Get.snackbar(
        'Error',
        'Please enter a valid amount',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    try {
      EasyLoading.show(status: 'Initiating transfer...');
      
      final result = await _walletRepository.transfer(
        transferRecipientIdController.text.trim(),
        amount,
      );
      
      EasyLoading.dismiss();
      
      // Store values for OTP confirmation
      transferRecipientId.value = transferRecipientIdController.text.trim();
      transferAmount.value = amount;
      
      // Show OTP input
      showTransferOtp.value = true;
      
      Get.snackbar(
        'Success',
        result['message'] ?? 'OTP sent for transfer verification',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
    } catch (e) {
      EasyLoading.dismiss();
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }
  }
  
  Future<void> confirmTransferOtp() async {
    if (transferOtpController.text.isEmpty) {
      Get.snackbar(
        'Error',
        'Please enter the OTP',
        snackPosition: SnackPosition.BOTTOM,
      );
      return;
    }
    
    try {
      EasyLoading.show(status: 'Confirming transfer...');
      
      final result = await _walletRepository.confirmTransfer(
        transferRecipientId.value,
        transferAmount.value,
        transferOtpController.text.trim(),
      );
      
      EasyLoading.dismiss();
      
      Get.back(); // Close the transfer dialog
      
      Get.snackbar(
        'Success',
        result['message'] ?? 'Transfer completed successfully',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white,
      );
      
      // Reset state
      showTransferOtp.value = false;
      transferRecipientIdController.clear();
      transferAmountController.clear();
      transferOtpController.clear();
      
      // Refresh wallet balance
      await refreshWalletBalance();
    } catch (e) {
      EasyLoading.dismiss();
      Get.snackbar(
        'Error',
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red,
        colorText: Colors.white,
      );
    }
  }
  
  void cancelTransferOtp() {
    showTransferOtp.value = false;
    transferOtpController.clear();
  }
  
  @override
  void onClose() {
    depositAmountController.dispose();
    depositMerchantNumberController.dispose();
    withdrawalAmountController.dispose();
    withdrawalMerchantNumberController.dispose();
    withdrawalOtpController.dispose();
    transferRecipientIdController.dispose();
    transferAmountController.dispose();
    transferOtpController.dispose();
    super.onClose();
  }
}
