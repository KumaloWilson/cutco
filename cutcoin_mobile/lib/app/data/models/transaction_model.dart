class Transaction {
  final int id;
  final String reference;
  final String type;
  final double amount;
  final double fee;
  final String status;
  final String description;
  final Map<String, dynamic>? sender;
  final Map<String, dynamic>? receiver;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Transaction({
    required this.id,
    required this.reference,
    required this.type,
    required this.amount,
    required this.fee,
    required this.status,
    required this.description,
    this.sender,
    this.receiver,
    required this.createdAt,
    this.updatedAt,
  });

  factory Transaction.fromJson(Map<String, dynamic> json) {
    return Transaction(
      id: json['id'],
      reference: json['reference'],
      type: json['type'],
      amount: double.parse(json['amount'].toString()),
      fee: double.parse(json['fee'].toString()),
      status: json['status'],
      description: json['description'],
      sender: json['sender'],
      receiver: json['receiver'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: json['updatedAt'] != null ? DateTime.parse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'reference': reference,
      'type': type,
      'amount': amount,
      'fee': fee,
      'status': status,
      'description': description,
      'sender': sender,
      'receiver': receiver,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}
