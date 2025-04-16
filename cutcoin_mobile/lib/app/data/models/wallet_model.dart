class Wallet {
  final String studentId;
  final double balance;
  final String walletAddress;

  Wallet({
    required this.studentId,
    required this.balance,
    required this.walletAddress,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      studentId: json['user']['studentId'],
      balance: double.parse(json['balance'].toString()),
      walletAddress: json['walletAddress'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': studentId,
      'balance': balance,
      'walletAddress': walletAddress,
    };
  }
}
