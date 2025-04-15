import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import 'package:cutcoin_mobile/app/modules/auth/controllers/verify_otp_controller.dart';
import 'package:cutcoin_mobile/app/core/theme/app_colors.dart';

class VerifyOtpView extends GetView<VerifyOtpController> {
  const VerifyOtpView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verify OTP'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Verification Code',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'We have sent a verification code to your phone number. Please enter the code below.',
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.grey,
                  ),
                ),
                const SizedBox(height: 40),
                PinCodeTextField(
                  appContext: context,
                  length: 6,
                  obscureText: false,
                  animationType: AnimationType.fade,
                  pinTheme: PinTheme(
                    shape: PinCodeFieldShape.box,
                    borderRadius: BorderRadius.circular(8),
                    fieldHeight: 50,
                    fieldWidth: 40,
                    activeFillColor: AppColors.lightGrey,
                    inactiveFillColor: AppColors.lightGrey,
                    selectedFillColor: AppColors.lightGrey,
                    activeColor: AppColors.primary,
                    inactiveColor: AppColors.lightGrey,
                    selectedColor: AppColors.primary,
                  ),
                  animationDuration: const Duration(milliseconds: 300),
                  enableActiveFill: true,
                  controller: controller.otpController,
                  onCompleted: (v) {
                    // Auto-submit when all digits are entered
                    controller.verifyOtp();
                  },
                  onChanged: (value) {
                    // No need to do anything here
                  },
                  beforeTextPaste: (text) {
                    // If you return true then it will show the paste confirmation dialog
                    return true;
                  },
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Didn\'t receive the code?',
                      style: TextStyle(color: AppColors.grey),
                    ),
                    TextButton(
                      onPressed: controller.resendOtp,
                      child: const Text('Resend'),
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: controller.verifyOtp,
                    child: const Text('Verify'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
