import 'package:flutter/material.dart';

class CommunityBrand {
  final bool found;
  final String? institutionId;
  final String? slug;
  final String? subdomain;
  final String? customDomain;
  final String? name;
  final BrandConfig? brandConfig;

  const CommunityBrand({
    required this.found,
    this.institutionId,
    this.slug,
    this.subdomain,
    this.customDomain,
    this.name,
    this.brandConfig,
  });

  factory CommunityBrand.fromJson(Map<String, dynamic> json) {
    return CommunityBrand(
      found: json['found'] as bool? ?? false,
      institutionId: json['institutionId'] as String?,
      slug: json['slug'] as String?,
      subdomain: json['subdomain'] as String?,
      customDomain: json['customDomain'] as String?,
      name: json['name'] as String?,
      brandConfig: json['brandConfig'] != null
          ? BrandConfig.fromJson(json['brandConfig'] as Map<String, dynamic>)
          : null,
    );
  }

  String get displayName => brandConfig?.displayName ?? name ?? 'TrustGrid';
  String get appName => brandConfig?.appName ?? displayName;
  Color get primaryColor => brandConfig?.primaryColorValue ?? const Color(0xFF4F46E5);
  Color get accentColor => brandConfig?.accentColorValue ?? const Color(0xFF0D9488);
  String? get logoUrl => brandConfig?.logoUrl;
  bool get poweredByVisible => brandConfig?.poweredByVisible ?? true;
}

class BrandConfig {
  final String? displayName;
  final String? tagline;
  final String? primaryColor;
  final String? accentColor;
  final String? logoUrl;
  final String? appName;
  final bool? poweredByVisible;

  const BrandConfig({
    this.displayName,
    this.tagline,
    this.primaryColor,
    this.accentColor,
    this.logoUrl,
    this.appName,
    this.poweredByVisible,
  });

  factory BrandConfig.fromJson(Map<String, dynamic> json) {
    return BrandConfig(
      displayName: json['displayName'] as String?,
      tagline: json['tagline'] as String?,
      primaryColor: json['primaryColor'] as String?,
      accentColor: json['accentColor'] as String?,
      logoUrl: json['logoUrl'] as String?,
      appName: json['appName'] as String?,
      poweredByVisible: json['poweredByVisible'] as bool?,
    );
  }

  Color get primaryColorValue {
    if (primaryColor == null) return const Color(0xFF4F46E5);
    try {
      final hex = primaryColor!.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFF4F46E5);
    }
  }

  Color get accentColorValue {
    if (accentColor == null) return const Color(0xFF0D9488);
    try {
      final hex = accentColor!.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (_) {
      return const Color(0xFF0D9488);
    }
  }
}
