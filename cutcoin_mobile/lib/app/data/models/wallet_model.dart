class Wallet {
  final int id;
  final int userId;
  final double balance;
  final String walletAddress;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Wallet({
    required this.id,
    required this.userId,
    required this.balance,
    required this.walletAddress,
    required this.createdAt,
    this.updatedAt,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      id: json['id'],
      userId: json['userId'],
      balance: double.parse(json['balance'].toString()),
      walletAddress: json['walletAddress'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'balance': balance,
      'walletAddress': walletAddress,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
