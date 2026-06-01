import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register Institution'),
        leading: BackButton(onPressed: () => context.go('/login')),
      ),
      body: const Center(
        child: Text('Registration — Post-MVP', style: TextStyle(color: TrustGridColors.textSecondary)),
      ),
    );
  }
}
