import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/splash/bindings/splash_binding.dart';
import 'package:cutcoin_mobile/app/modules/splash/views/splash_view.dart';
import 'package:cutcoin_mobile/app/modules/onboarding/bindings/onboarding_binding.dart';
import 'package:cutcoin_mobile/app/modules/onboarding/views/onboarding_view.dart';
import 'package:cutcoin_mobile/app/modules/auth/bindings/auth_binding.dart';
import 'package:cutcoin_mobile/app/modules/auth/views/login_view.dart';
import 'package:cutcoin_mobile/app/modules/auth/views/register_view.dart';
import 'package:cutcoin_mobile/app/modules/auth/views/verify_otp_view.dart';
import 'package:cutcoin_mobile/app/modules/home/bindings/home_binding.dart';
import 'package:cutcoin_mobile/app/modules/home/views/home_view.dart';
import 'package:cutcoin_mobile/app/modules/wallet/bindings/wallet_binding.dart';
import 'package:cutcoin_mobile/app/modules/wallet/views/wallet_view.dart';
import 'package:cutcoin_mobile/app/modules/transactions/bindings/transactions_binding.dart';
import 'package:cutcoin_mobile/app/modules/transactions/views/transactions_view.dart';
import 'package:cutcoin_mobile/app/modules/profile/bindings/profile_binding.dart';
import 'package:cutcoin_mobile/app/modules/profile/views/profile_view.dart';
import 'package:cutcoin_mobile/app/modules/dashboard/bindings/dashboard_binding.dart';
import 'package:cutcoin_mobile/app/modules/dashboard/views/dashboard_view.dart';

part 'app_routes.dart';

class AppPages {
  AppPages._();

  static const INITIAL = Routes.SPLASH;

  static final routes = [
    GetPage(
      name: _Paths.SPLASH,
      page: () => const SplashView(),
      binding: SplashBinding(),
    ),
    GetPage(
      name: _Paths.ONBOARDING,
      page: () => const OnboardingView(),
      binding: OnboardingBinding(),
    ),
    GetPage(
      name: _Paths.LOGIN,
      page: () => const LoginView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: _Paths.REGISTER,
      page: () => const RegisterView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: _Paths.VERIFY_OTP,
      page: () => const VerifyOtpView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: _Paths.DASHBOARD,
      page: () => const DashboardView(),
      binding: DashboardBinding(),
    ),
    GetPage(
      name: _Paths.HOME,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: _Paths.WALLET,
      page: () => const WalletView(),
      binding: WalletBinding(),
    ),
    GetPage(
      name: _Paths.TRANSACTIONS,
      page: () => const TransactionsView(),
      binding: TransactionsBinding(),
    ),
    GetPage(
      name: _Paths.PROFILE,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
    ),
  ];
}
