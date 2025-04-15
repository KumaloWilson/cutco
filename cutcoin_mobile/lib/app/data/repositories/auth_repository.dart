import 'package:dio/dio.dart';
import 'package:cutcoin_mobile/app/data/providers/api_provider.dart';
import 'package:cutcoin_mobile/app/core/utils/logger.dart';

class AuthRepository {
  final ApiProvider _apiProvider;

  AuthRepository(this._apiProvider);

  Future<Map<String, dynamic>> login(String studentId, String pin) async {
    try {
      final response = await _apiProvider.login(studentId, pin);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Login repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Login failed';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Login repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> verifyLoginOtp(String studentId, String code) async {
    try {
      final response = await _apiProvider.verifyLoginOtp(studentId, code);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Verify login OTP repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'OTP verification failed';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Verify login OTP repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    try {
      final response = await _apiProvider.register(userData);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Register repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Registration failed';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Register repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String phoneNumber, String code, String purpose) async {
    try {
      final response = await _apiProvider.verifyOtp(phoneNumber, code, purpose);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Verify OTP repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'OTP verification failed';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Verify OTP repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> requestPasswordReset(String studentId, String phoneNumber) async {
    try {
      final response = await _apiProvider.requestPasswordReset(studentId, phoneNumber);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Request password reset repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Password reset request failed';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Request password reset repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Map<String, dynamic>> resetPin(String studentId, String code, String newPin) async {
    try {
      final response = await _apiProvider.resetPin(studentId, code, newPin);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Reset PIN repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'PIN reset failed';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Reset PIN repository error', e);
      throw 'An unexpected error occurred';
    }
  }
}
