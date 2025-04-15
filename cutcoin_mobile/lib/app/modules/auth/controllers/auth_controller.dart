import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/data/repositories/auth_repository.dart';
import 'package:cutcoin_mobile/app/core/storage/storage_service.dart';
import 'package:cutcoin_mobile/app/routes/app_pages.dart';

class AuthController extends GetxController {
  final AuthRepository _authRepository = Get.find<AuthRepository>();
  final StorageService _storageService = Get.find<StorageService>();
  
  final isLoggedIn = false.obs;
  
  @override
  void onInit() {
    super.onInit();
    checkLoginStatus();
  }
  
  Future<void> checkLoginStatus() async {
    final token = await _storageService.getToken();
    isLoggedIn.value = token != null && token.isNotEmpty;
  }
  
  Future<void> saveAuthData(Map<String, dynamic> data) async {
    final token = data['token'];
    final user = data['user'];
    
    await _storageService.saveToken(token);
    await _storageService.saveUserId(user['id'].toString());
    await _storageService.saveStudentId(user['studentId']);
    await _storageService.saveUserName('${user['firstName']} ${user['lastName']}');
    
    isLoggedIn.value = true;
  }
  
  Future<void> logout() async {
    await _storageService.clearToken();
    isLoggedIn.value = false;
    Get.offAllNamed(Routes.LOGIN);
  }
}
