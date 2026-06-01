import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'community_provider.dart';

/// Handles trustgrid://join/:slug and https://community.trustgrid.ng/join
/// Sets the community then routes to login or community select.
class JoinRedirectScreen extends ConsumerStatefulWidget {
  final String slug;
  const JoinRedirectScreen({super.key, required this.slug});

  @override
  ConsumerState<JoinRedirectScreen> createState() => _JoinRedirectScreenState();
}

class _JoinRedirectScreenState extends ConsumerState<JoinRedirectScreen> {
  @override
  void initState() {
    super.initState();
    _handleJoin();
  }

  Future<void> _handleJoin() async {
    final slug = widget.slug.isNotEmpty ? widget.slug : null;
    if (slug != null) {
      try {
        await ref.read(communityBrandProvider.notifier).fetchAndSet(slug);
        final brand = ref.read(communityBrandProvider).valueOrNull;
        if (brand?.found == true && mounted) {
          context.go('/login');
          return;
        }
      } catch (_) {}
    }
    if (mounted) context.go('/community');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF1e1b4b),
      body: Center(
        child: CircularProgressIndicator(color: Colors.white),
      ),
    );
  }
}
