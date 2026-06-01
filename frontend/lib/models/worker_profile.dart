class WorkerProfile {
  final String id;
  final String firstName;
  final String lastName;
  final String? profilePhotoUrl;
  final String primarySkill;
  final List<String> skills;
  final double trustScore;
  final String trustGrade;
  final String trustGradeColor;
  final String verificationStatus;
  final int totalDeployments;
  final double? averageRating;
  final int endorsementCount;
  final bool isAvailable;
  final String? bio;
  final int? yearsExperience;
  final double? hourlyRate;
  final double? dailyRate;
  final String currency;

  const WorkerProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.profilePhotoUrl,
    required this.primarySkill,
    required this.skills,
    required this.trustScore,
    required this.trustGrade,
    required this.trustGradeColor,
    required this.verificationStatus,
    required this.totalDeployments,
    this.averageRating,
    required this.endorsementCount,
    required this.isAvailable,
    this.bio,
    this.yearsExperience,
    this.hourlyRate,
    this.dailyRate,
    this.currency = 'NGN',
  });

  String get fullName => '$firstName $lastName';

  bool get isVerified => verificationStatus == 'FULLY_VERIFIED';

  factory WorkerProfile.fromJson(Map<String, dynamic> json) {
    return WorkerProfile(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      profilePhotoUrl: json['profilePhotoUrl'] as String?,
      primarySkill: json['primarySkill'] as String,
      skills: List<String>.from(json['skills'] as List? ?? []),
      trustScore: (json['trustScore'] as num).toDouble(),
      trustGrade: json['trustGrade'] as String? ?? 'F',
      trustGradeColor: json['trustGradeColor'] as String? ?? '#EF4444',
      verificationStatus: json['verificationStatus'] as String,
      totalDeployments: json['totalDeployments'] as int? ?? 0,
      averageRating: json['averageRating'] != null
          ? (json['averageRating'] as num).toDouble()
          : null,
      endorsementCount: json['endorsementCount'] as int? ?? 0,
      isAvailable: json['isAvailable'] as bool? ?? false,
      bio: json['bio'] as String?,
      yearsExperience: json['yearsExperience'] as int?,
      hourlyRate: json['hourlyRate'] != null
          ? (json['hourlyRate'] as num).toDouble()
          : null,
      dailyRate: json['dailyRate'] != null
          ? (json['dailyRate'] as num).toDouble()
          : null,
      currency: json['currency'] as String? ?? 'NGN',
    );
  }
}
