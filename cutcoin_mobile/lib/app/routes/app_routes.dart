part of 'app_pages.dart';

abstract class Routes {
  Routes._();
  static const SPLASH = _Paths.SPLASH;
  static const ONBOARDING = _Paths.ONBOARDING;
  static const LOGIN = _Paths.LOGIN;
  static const REGISTER = _Paths.REGISTER;
  static const VERIFY_OTP = _Paths.VERIFY_OTP;
  static const DASHBOARD = _Paths.DASHBOARD;
  static const HOME = _Paths.HOME;
  static const WALLET = _Paths.WALLET;
  static const TRANSACTIONS = _Paths.TRANSACTIONS;
  static const PROFILE = _Paths.PROFILE;
}

abstract class _Paths {
  _Paths._();
  static const SPLASH = '/splash';
  static const ONBOARDING = '/onboarding';
  static const LOGIN = '/login';
  static const REGISTER = '/register';
  static const VERIFY_OTP = '/verify-otp';
  static const DASHBOARD = '/dashboard';
  static const HOME = '/home';
  static const WALLET = '/wallet';
  static const TRANSACTIONS = '/transactions';
  static const PROFILE = '/profile';
}
