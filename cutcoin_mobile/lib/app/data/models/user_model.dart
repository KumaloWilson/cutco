class User {
  final int id;
  final String studentId;
  final String firstName;
  final String lastName;
  final String phoneNumber;
  final String? email;
  final String kycStatus;
  final UserWallet? wallet;


  User({
    required this.id,
    required this.studentId,
    required this.firstName,
    required this.lastName,
    required this.phoneNumber,
    required this.kycStatus,
    required this.wallet,
    this.email,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      studentId: json['studentId'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      phoneNumber: json['phoneNumber'],
      email: json['email'],
      kycStatus: json['kycStatus'],
      wallet: json['wallet'] != null ? UserWallet.fromJson(json['wallet']) : null,
    );
  }
}

class UserWallet{
  String? walletAddress;
  String? balance;

  UserWallet({
    this.walletAddress,
    this.balance,
  });

  factory UserWallet.fromJson(Map<String, dynamic> json) {
    return UserWallet(
      walletAddress: json['walletAddress'],
      balance: json['balance'],
    );
  }
}
