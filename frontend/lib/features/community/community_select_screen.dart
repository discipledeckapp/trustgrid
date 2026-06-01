import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'community_provider.dart';

class CommunitySelectScreen extends ConsumerStatefulWidget {
  const CommunitySelectScreen({super.key});

  @override
  ConsumerState<CommunitySelectScreen> createState() =>
      _CommunitySelectScreenState();
}

class _CommunitySelectScreenState extends ConsumerState<CommunitySelectScreen> {
  final _controller = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _continue() async {
    final code = _controller.text.trim().toLowerCase();
    if (code.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(communityBrandProvider.notifier).fetchAndSet(code);
      final brand = ref.read(communityBrandProvider).valueOrNull;
      if (brand?.found == true && mounted) {
        context.go('/login');
      } else if (mounted) {
        setState(() {
          _error = 'Community not found. Check the code and try again.';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo
              Center(
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF4F46E5), Color(0xFF0D9488)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.shield_rounded,
                    color: Colors.white,
                    size: 40,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Welcome to TrustGrid',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF1E293B),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Enter your community code to get started.',
                style: TextStyle(fontSize: 15, color: Color(0xFF64748B)),
              ),
              const SizedBox(height: 32),
              // Input
              TextField(
                controller: _controller,
                textInputAction: TextInputAction.go,
                onSubmitted: (_) => _continue(),
                autocorrect: false,
                enableSuggestions: false,
                decoration: InputDecoration(
                  labelText: 'Community code',
                  hintText: 'e.g. rccg or lekki-estate',
                  prefixIcon: const Icon(Icons.group_rounded),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  errorText: _error,
                ),
              ),
              const SizedBox(height: 16),
              // Continue button
              FilledButton(
                onPressed: _loading ? null : _continue,
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  minimumSize: const Size.fromHeight(52),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _loading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text(
                        'Continue',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
              ),
              const SizedBox(height: 12),
              TextButton.icon(
                onPressed: null,
                icon: const Icon(Icons.qr_code_rounded, size: 18),
                label: const Text('Scan QR code instead (coming soon)'),
              ),
              const Spacer(),
              const Text(
                'Powered by TrustGrid',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Color(0xFFCBD5E1)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
