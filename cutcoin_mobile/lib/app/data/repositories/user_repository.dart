// import 'package:dio/dio.dart';
// import 'package:cutcoin_mobile/app/data/providers/api_provider.dart';
// import 'package:cutcoin_mobile/app/core/utils/logger.dart';
// import 'package:cutcoin_mobile/app/data/models/user_model.dart';
// import 'package:cutcoin_mobile/app/data/models/notification_model.dart';
//
// class UserRepository {
//   final ApiProvider _apiProvider;
//
//   UserRepository(this._apiProvider);
//
//   Future<User> getUserProfile() async {
//     try {
//       final response = await _apiProvider.getUserProfile();
//       return User.fromJson(response.data);
//     } on DioException catch (e) {
//       LoggerService.e('Get user profile repository error', e);
//       if (e.response != null) {
//         throw e.response!.data['message'] ?? 'Failed to get user profile';
//       }
//       throw 'Network error occurred';
//     } catch (e) {
//       LoggerService.e('Get user profile repository error', e);
//       throw 'An unexpected error occurred';
//     }
//   }
//
//   Future<User> updateUserProfile(Map<String, dynamic> userData) async {
//     try {
//       final response = await _apiProvider.updateUserProfile(userData);
//       return User.fromJson(response.data);
//     } on DioException catch (e) {
//       LoggerService.e('Update user profile repository error', e);
//       if (e.response != null) {
//         throw e.response!.data['message'] ?? 'Failed to update user profile';
//       }
//       throw 'Network error occurred';
//     } catch (e) {
//       LoggerService.e('Update user profile repository error', e);
//       throw 'An unexpected error occurred';
//     }
//   }
//
//   Future<Map<String, dynamic>> getNotifications({int? page, int? limit}) async {
//     try {
//       final response = await _apiProvider.getNotifications(
//         page: page,
//         limit: limit,
//       );
//
//       final notifications = (response.data['notifications'] as List)
//           .map((json) => Notification.fromJson(json))
//           .toList();
//
//       return {
//         'notifications': notifications,
//         'pagination': response.data['pagination'],
//       };
//     } on DioException catch (e) {
//       LoggerService.e('Get notifications repository error', e);
//       if (e.response != null) {
//         throw e.response!.data['message'] ?? 'Failed to get notifications';
//       }
//       throw 'Network error occurred';
//     } catch (e) {
//       LoggerService.e('Get notifications repository error', e);
//       throw 'An unexpected error occurred';
//     }
//   }
//
//   Future<Map<String, dynamic>> markNotificationAsRead(int notificationId) async {
//     try {
//       final response = await _apiProvider.markNotificationAsRead(notificationId);
//       return response.data;
//     } on DioException catch (e) {
//       LoggerService.e('Mark notification as read repository error', e);
//       if (e.response != null) {
//         throw e.response!.data['message'] ?? 'Failed to mark notification as read';
//       }
//       throw 'Network error occurred';
//     } catch (e) {
//       LoggerService.e('Mark notification as read repository error', e);
//       throw 'An unexpected error occurred';
//     }
//   }
//
//   Future<Map<String, dynamic>> markAllNotificationsAsRead() async {
//     try {
//       final response = await _apiProvider.markAllNotificationsAsRead();
//       return response.data;
//     } on DioException catch (e) {
//       LoggerService.e('Mark all notifications as read repository error', e);
//       if (e.response != null) {
//         throw e.response!.data['message'] ?? 'Failed to mark all notifications as read';
//       }
//       throw 'Network error occurred';
//     } catch (e) {
//       LoggerService.e('Mark all notifications as read repository error', e);
//       throw 'An unexpected error occurred';
//     }
//   }
// }

import 'package:dio/dio.dart';
import 'package:cutcoin_mobile/app/data/providers/api_provider.dart';
import 'package:cutcoin_mobile/app/core/utils/logger.dart';
import 'package:cutcoin_mobile/app/data/models/user_model.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';

class UserRepository {
  final ApiProvider _apiProvider;
  final StorageService _storageService;

  UserRepository(this._apiProvider) : _storageService = StorageService();

  Future<User> getUserProfile() async {
    try {
      final response = await _apiProvider.getUserProfile();
      return User.fromJson(response.data['user']);
    } on DioException catch (e) {
      LoggerService.e('Get user profile repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to get user profile';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Get user profile repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<void> updateUserProfile(Map<String, dynamic> userData) async {
    try {
      final response = await _apiProvider.updateUserProfile(userData);
      return response.data;
    } on DioException catch (e) {
      LoggerService.e('Update user profile repository error', e);
      if (e.response != null) {
        throw e.response!.data['message'] ?? 'Failed to update user profile';
      }
      throw 'Network error occurred';
    } catch (e) {
      LoggerService.e('Update user profile repository error', e);
      throw 'An unexpected error occurred';
    }
  }

  Future<void> saveUserName(String userName) async {
    await _storageService.saveUserName(userName);
  }
}
