import 'package:dio/dio.dart';
import 'package:cutcoin_mobile/app/data/providers/api_provider.dart';
import 'package:cutcoin_mobile/app/core/utils/logger.dart';
import 'package:cutcoin_mobile/app/data/models/transaction_model.dart';

class TransactionRepository {
  final ApiProvider _apiProvider;

  TransactionRepository(this._apiProvider);

  Future<Map<String, dynamic>> getTransactionHistory({int? page, int? limit, String? type}) async {
    try {
      final response = await _apiProvider.getTransactionHistory(
        page: page,
        limit: limit,
        type: type,
      );

      final List<Transaction> transactions = (response.data['transactions'] as List)
          .map((item) => Transaction.fromJson(item))
          .toList();

      return {
        'transactions': transactions,
        'pagination': response.data['pagination'],
      };
    } on DioException catch (e) {
      LoggerService.e('Get transaction history repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to get transaction history';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Get transaction history repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<Transaction> getTransactionDetails(int transactionId) async {
    try {
      final response = await _apiProvider.getTransactionDetails(transactionId);
      return Transaction.fromJson(response.data['transaction']);
    } on DioException catch (e) {
      LoggerService.e('Get transaction details repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to get transaction details';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Get transaction details repository error', e);
      throw 'An unexpected error occurred';
    }
  }
}
