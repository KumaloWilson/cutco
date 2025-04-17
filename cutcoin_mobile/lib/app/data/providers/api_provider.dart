import 'package:dio/dio.dart';
import 'package:cutcoin_mobile/app/core/network/dio_client.dart';
import 'package:cutcoin_mobile/app/core/utils/logger.dart';

class ApiProvider {
  final DioClient _dioClient;

  ApiProvider(this._dioClient);

  // Auth endpoints
  Future<Response> login(String studentId, String pin) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/login',
        data: {
          'studentId': studentId,
          'pin': pin,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Login error', e);
      rethrow;
    }
  }

  Future<Response> verifyLoginOtp(String studentId, String code) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/verify-login',
        data: {
          'studentId': studentId,
          'code': code,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Verify login OTP error', e);
      rethrow;
    }
  }

  Future<Response> register(Map<String, dynamic> userData) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/register',
        data: userData,
      );
      return response;
    } catch (e) {
      LoggerService.e('Register error', e);
      rethrow;
    }
  }

  Future<Response> verifyOtp(String phoneNumber, String code, String purpose) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/verify-otp',
        data: {
          'phoneNumber': phoneNumber,
          'code': code,
          'purpose': purpose,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Verify OTP error', e);
      rethrow;
    }
  }

  Future<Response> requestPasswordReset(String studentId, String phoneNumber) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/request-reset',
        data: {
          'studentId': studentId,
          'phoneNumber': phoneNumber,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Request password reset error', e);
      rethrow;
    }
  }

  Future<Response> resetPin(String studentId, String code, String newPin) async {
    try {
      final response = await _dioClient.dio.post(
        '/auth/reset-pin',
        data: {
          'studentId': studentId,
          'code': code,
          'newPin': newPin,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Reset PIN error', e);
      rethrow;
    }
  }

  // Wallet endpoints
  Future<Response> getWalletBalance() async {
    try {
      final response = await _dioClient.dio.get('/wallets/balance');

      return response;
    } catch (e) {
      LoggerService.e('Get wallet balance error', e);
      rethrow;
    }
  }

  Future<Response> initiateDeposit(double amount, String merchantNumber) async {
    try {
      final response = await _dioClient.dio.post(
        '/wallets/deposit/initiate',
        data: {
          'amount': amount,
          'merchantNumber': merchantNumber,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Initiate deposit error', e);
      rethrow;
    }
  }

  Future<Response> initiateWithdrawal(double amount, String merchantNumber) async {
    try {
      final response = await _dioClient.dio.post(
        '/wallets/withdraw/initiate',
        data: {
          'amount': amount,
          'merchantNumber': merchantNumber,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Initiate withdrawal error', e);
      rethrow;
    }
  }

  Future<Response> confirmWithdrawalOTP(double amount, String merchantNumber, String code) async {
    try {
      final response = await _dioClient.dio.post(
        '/wallets/withdraw/confirm-otp',
        data: {
          'amount': amount,
          'merchantNumber': merchantNumber,
          'code': code,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Confirm withdrawal OTP error', e);
      rethrow;
    }
  }

  Future<Response> transfer(String recipientId, double amount) async {
    try {
      final response = await _dioClient.dio.post(
        '/wallets/transfer',
        data: {
          'recipientId': recipientId,
          'amount': amount,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Transfer error', e);
      rethrow;
    }
  }

  Future<Response> confirmTransfer(String recipientId, double amount, String code) async {
    try {
      final response = await _dioClient.dio.post(
        '/wallets/transfer/confirm',
        data: {
          'recipientId': recipientId,
          'amount': amount,
          'code': code,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Confirm transfer error', e);
      rethrow;
    }
  }

  // Transaction endpoints
  Future<Response> getTransactionHistory({int? page, int? limit, String? type}) async {
    try {
      final response = await _dioClient.dio.get(
        '/wallets/transactions',
        queryParameters: {
          'page': page,
          'limit': limit,
          'type': type,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Get transaction history error', e);
      rethrow;
    }
  }

  Future<Response> getTransactionDetails(int transactionId) async {
    try {
      final response = await _dioClient.dio.get('/wallets/transactions/$transactionId');
      return response;
    } catch (e) {
      LoggerService.e('Get transaction details error', e);
      rethrow;
    }
  }

  Future<Response> getPendingTransactions() async {
    try {
      final response = await _dioClient.dio.get('/wallets/pending-transactions');
      return response;
    } catch (e) {
      LoggerService.e('Get pending transactions error', e);
      rethrow;
    }
  }

  Future<Response> cancelTransaction(String reference) async {
    try {
      final response = await _dioClient.dio.post(
        '/wallets/transaction/cancel',
        data: {
          'reference': reference,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Cancel transaction error', e);
      rethrow;
    }
  }

  // User profile endpoints
  Future<Response> getUserProfile() async {
    try {
      final response = await _dioClient.dio.get('/users/profile');
      return response;
    } catch (e) {
      LoggerService.e('Get user profile error', e);
      rethrow;
    }
  }

  Future<Response> updateUserProfile(Map<String, dynamic> userData) async {
    try {
      final response = await _dioClient.dio.put(
        '/users/profile',
        data: userData,
      );
      return response;
    } catch (e) {
      LoggerService.e('Update user profile error', e);
      rethrow;
    }
  }

  // Notifications endpoints
  Future<Response> getNotifications({int? page, int? limit}) async {
    try {
      final response = await _dioClient.dio.get(
        '/notifications/user',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );
      return response;
    } catch (e) {
      LoggerService.e('Get notifications error', e);
      rethrow;
    }
  }
  

  Future<Response> markNotificationAsRead(int notificationId) async {
    try {
      final response = await _dioClient.dio.put('/notifications/user/$notificationId/read');
      return response;
    } catch (e) {
      LoggerService.e('Mark notification as read error', e);
      rethrow;
    }
  }

  Future<Response> markAllNotificationsAsRead() async {
    try {
      final response = await _dioClient.dio.put('/notifications/user/read-all');
      return response;
    } catch (e) {
      LoggerService.e('Mark all notifications as read error', e);
      rethrow;
    }
  }
}
