class Notification {
  final int id;
  final int userId;
  final String title;
  final String message;
  final bool isRead;
  final String type;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;

  Notification({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.isRead,
    required this.type,
    this.metadata,
    required this.createdAt,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'],
      userId: json['userId'],
      title: json['title'],
      message: json['message'],
      isRead: json['isRead'],
      type: json['type'],
      metadata: json['metadata'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'title': title,
      'message': message,
      'isRead': isRead,
      'type': type,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
