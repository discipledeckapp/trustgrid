import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../../models/community_brand.dart';

const _kCommunitySlug = 'community_slug';
const _kCommunityJson = 'community_brand_json';
const _baseUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'https://trustgrid-backend.onrender.com/api/v1',
);

// The active community brand
final communityBrandProvider =
    StateNotifierProvider<CommunityBrandNotifier, AsyncValue<CommunityBrand?>>(
  (ref) => CommunityBrandNotifier(),
);

class CommunityBrandNotifier extends StateNotifier<AsyncValue<CommunityBrand?>> {
  CommunityBrandNotifier() : super(const AsyncValue.loading()) {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final slug = prefs.getString(_kCommunitySlug);
    if (slug == null) {
      state = const AsyncValue.data(null); // no community selected
      return;
    }
    // Try to refresh from API, fall back to null (will redirect to community select)
    try {
      await fetchAndSet(slug);
    } catch (_) {
      state = const AsyncValue.data(null);
    }
  }

  Future<void> fetchAndSet(String slugOrDomain) async {
    state = const AsyncValue.loading();
    try {
      final host = slugOrDomain.contains('.')
          ? slugOrDomain
          : '$slugOrDomain.trustgrid.ng';
      final dio = Dio();
      final response = await dio.get(
        '$_baseUrl/institutions/brand',
        queryParameters: {'host': host},
      );
      final brand = CommunityBrand.fromJson(response.data as Map<String, dynamic>);
      if (!brand.found) {
        state = AsyncValue.error(
          'Community not found: $slugOrDomain',
          StackTrace.current,
        );
        return;
      }
      // Persist
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kCommunitySlug, brand.slug ?? slugOrDomain);
      state = AsyncValue.data(brand);
    } on DioException catch (e) {
      state = AsyncValue.error(
        e.message ?? 'Network error',
        e.stackTrace ?? StackTrace.current,
      );
    }
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kCommunitySlug);
    await prefs.remove(_kCommunityJson);
    state = const AsyncValue.data(null);
  }
}

// Derived: effective brand (with defaults)
final effectiveBrandProvider = Provider<CommunityBrand>((ref) {
  final brandAsync = ref.watch(communityBrandProvider);
  return brandAsync.valueOrNull ?? const CommunityBrand(found: false);
});
