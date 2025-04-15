import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:cutcoin_mobile/app/modules/home/views/home_view.dart';
import 'package:cutcoin_mobile/app/modules/wallet/views/wallet_view.dart';
import 'package:cutcoin_mobile/app/modules/transactions/views/transactions_view.dart';
import 'package:cutcoin_mobile/app/modules/profile/views/profile_view.dart';

class DashboardController extends GetxController {
  final currentIndex = 0.obs;
  
  final pages = [
    const HomeView(),
    const WalletView(),
    const TransactionsView(),
    const ProfileView(),
  ];
  
  void changePage(int index) {
    currentIndex.value = index;
  }
}
