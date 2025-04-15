import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get/get.dart';

class StorageService extends GetxService {
  late FlutterSecureStorage _secureStorage;
  
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String userIdKey = 'user_id';
  static const String studentIdKey = 'student_id';
  static const String userNameKey = 'user_name';
  static const String firstTimeKey = 'first_time';
  static const String biometricsEnabledKey = 'biometrics_enabled';
  
  Future<StorageService> init() async {
    _secureStorage = const FlutterSecureStorage();
    return this;
  }
  
  // Token methods
  Future<void> saveToken(String token) async {
    await _secureStorage.write(key: tokenKey, value: token);
  }
  
  Future<String?> getToken() async {
    return await _secureStorage.read(key: tokenKey);
  }
  
  Future<void> clearToken() async {
    await _secureStorage.delete(key: tokenKey);
  }
  
  // User methods
  Future<void> saveUserId(String userId) async {
    await _secureStorage.write(key: userIdKey, value: userId);
  }
  
  Future<String?> getUserId() async {
    return await _secureStorage.read(key: userIdKey);
  }
  
  Future<void> saveStudentId(String studentId) async {
    await _secureStorage.write(key: studentIdKey, value: studentId);
  }
  
  Future<String?> getStudentId() async {
    return await _secureStorage.read(key: studentIdKey);
  }
  
  Future<void> saveUserName(String userName) async {
    await _secureStorage.write(key: userNameKey, value: userName);
  }
  
  Future<String?> getUserName() async {
    return await _secureStorage.read(key: userNameKey);
  }
  
  // App state methods
  Future<void> setFirstTime(bool isFirstTime) async {
    await _secureStorage.write(key: firstTimeKey, value: isFirstTime.toString());
  }
  
  Future<bool> isFirstTime() async {
    final value = await _secureStorage.read(key: firstTimeKey);
    return value == null || value == 'true';
  }
  
  Future<void> setBiometricsEnabled(bool enabled) async {
    await _secureStorage.write(key: biometricsEnabledKey, value: enabled.toString());
  }
  
  Future<bool> isBiometricsEnabled() async {
    final value = await _secureStorage.read(key: biometricsEnabledKey);
    return value == 'true';
  }
  
  // Clear all data
  Future<void> clearAll() async {
    await _secureStorage.deleteAll();
  }
}
