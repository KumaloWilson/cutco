import 'package:dio/dio.dart';
import 'package:cutcoin_mobile/app/data/providers/api_provider.dart';
import 'package:cutcoin_mobile/app/core/utils/logger.dart';
import 'package:cutcoin_mobile/app/data/models/wallet_model.dart';

class WalletRepository {
  final ApiProvider _apiProvider;

  WalletRepository(this._apiProvider);

  Future<Wallet> getWalletBalance() async {
    try {
      final response = await _apiProvider.getWalletBalance();
      return Wallet.fromJson(response.data);
    } on DioException catch (e) {
      LoggerService.e('Get wallet balance repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to get wallet balance';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Get wallet balance repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> initiateDeposit(double amount, String merchantNumber) async {
    try {
      final response = await _apiProvider.initiateDeposit(amount, merchantNumber);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Initiate deposit repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to initiate deposit';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Initiate deposit repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> initiateWithdrawal(double amount, String merchantNumber) async {
    try {
      final response = await _apiProvider.initiateWithdrawal(amount, merchantNumber);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Initiate withdrawal repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to initiate withdrawal';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Initiate withdrawal repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> confirmWithdrawalOTP(double amount, String merchantNumber, String code) async {
    try {
      final response = await _apiProvider.confirmWithdrawalOTP(amount, merchantNumber, code);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Confirm withdrawal OTP repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to confirm withdrawal';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Confirm withdrawal OTP repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> transfer(String recipientId, double amount) async {
    try {
      final response = await _apiProvider.transfer(recipientId, amount);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Transfer repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to initiate transfer';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Transfer repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> confirmTransfer(String recipientId, double amount, String code) async {
    try {
      final response = await _apiProvider.confirmTransfer(recipientId, amount, code);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Confirm transfer repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to confirm transfer';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Confirm transfer repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> getPendingTransactions() async {
    try {
      final response = await _apiProvider.getPendingTransactions();
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Get pending transactions repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to get pending transactions';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Get pending transactions repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> cancelTransaction(String reference) async {
    try {
      final response = await _apiProvider.cancelTransaction(reference);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Cancel transaction repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to cancel transaction';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Cancel transaction repository error', e);
      throw 'An unexpected error occurred';
    }
  }
}
