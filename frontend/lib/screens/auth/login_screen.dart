import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController(text: '08001234567');
  final _passwordController = TextEditingController(text: 'Admin123!');
  final _institutionController = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _institutionController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });

    try {
      final api = ref.read(apiClientProvider);
      final response = await api.post('/auth/login', data: {
        'identifier': _identifierController.text.trim(),
        'password': _passwordController.text,
      });

      final data = response.data as Map<String, dynamic>;
      final tokens = data['tokens'] as Map<String, dynamic>;
      final user = data['user'] as Map<String, dynamic>;

      await api.saveTokens(
        accessToken: tokens['accessToken'] as String,
        refreshToken: tokens['refreshToken'] as String,
        institutionId: user['institutionId'] as String,
      );

      if (mounted) {
        final role = user['role'] as String;
        if (role == 'WORKER') {
          context.go('/worker/home');
        } else {
          context.go('/dashboard');
        }
      }
    } catch (e) {
      setState(() { _error = 'Invalid credentials. Try: 08001234567 or user@example.com / Admin123!'; });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(height: 40),
                // Logo
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: TrustGridColors.primary,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(Icons.verified_user, color: Colors.white, size: 36),
                ),
                const SizedBox(height: 20),
                const Text(
                  'TrustGrid',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: TrustGridColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Trusted People. Accountable Service.',
                  style: TextStyle(color: TrustGridColors.textSecondary, fontSize: 14),
                ),
                const SizedBox(height: 40),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'Sign in to your institution',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: TrustGridColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 24),
                          TextFormField(
                            controller: _identifierController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Phone or Email',
                              prefixIcon: Icon(Icons.person_outline),
                              hintText: '08001234567 or user@example.com',
                            ),
                            validator: (v) => v?.isEmpty == true ? 'Required' : null,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              labelText: 'Password',
                              prefixIcon: const Icon(Icons.lock_outline),
                              suffixIcon: IconButton(
                                icon: Icon(_obscurePassword
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined),
                                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                              ),
                            ),
                            validator: (v) => v?.isEmpty == true ? 'Required' : null,
                          ),
                          if (_error != null) ...[
                            const SizedBox(height: 12),
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: TrustGridColors.danger.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: TrustGridColors.danger.withOpacity(0.3)),
                              ),
                              child: Text(
                                _error!,
                                style: const TextStyle(color: TrustGridColors.danger, fontSize: 13),
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: _loading ? null : _login,
                            child: _loading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Sign In'),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: TrustGridColors.primary.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Demo credentials:\nPhone or Email: 08001234567 or emeka@redemptioncity.ng\nPassword: Admin123!',
                              style: TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
