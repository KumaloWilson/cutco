import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';
import 'package:cutcoin_mobile/app/core/utils/logger.dart';

class DioClient {
  late Dio _dio;
  final baseUrl = 'https://api-cutcoin.onrender.com/api';
  final StorageService _storageService = Get.find<StorageService>();
  
  DioClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 60),
        receiveTimeout: const Duration(seconds: 60),
        responseType: ResponseType.json,
      ),
    );
    _initializeInterceptors();
  }
  
  Dio get dio => _dio;
  
  void _initializeInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add auth token to request if available
          final token = await _storageService.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          
          LoggerService.d('REQUEST[${options.method}] => PATH: ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          LoggerService.d('RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}');
          return handler.next(response);
        },
        onError: (DioException e, handler) {
          LoggerService.e('ERROR[${e.response?.statusCode}] => PATH: ${e.requestOptions.path}');
          
          // Handle token expiration
          if (e.response?.statusCode == 401) {
            // Redirect to login
            _storageService.clearToken();
            Get.offAllNamed('/login');
            return handler.next(e);
          }
          
          return handler.next(e);
        },
      ),
    );
  }
}
