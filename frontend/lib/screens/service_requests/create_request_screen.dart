import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

class CreateRequestScreen extends ConsumerStatefulWidget {
  const CreateRequestScreen({super.key});

  @override
  ConsumerState<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends ConsumerState<CreateRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController(text: 'Convention Electricians — May 2026');
  final _descCtrl = TextEditingController(text: 'Need verified electricians for the RCCG National Convention. Stage power, generator maintenance, lighting systems.');
  final _skillCtrl = TextEditingController(text: 'Electrician');
  final _locationCtrl = TextEditingController(text: 'Redemption Camp, Lagos-Ibadan Expressway');
  int _workersNeeded = 50;
  double _minTrustScore = 65;
  String _priority = 'HIGH';
  String _category = 'cat_electrical';
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Service Request')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(labelText: 'Request Title *'),
                validator: (v) => v?.isEmpty == true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descCtrl,
                maxLines: 3,
                decoration: const InputDecoration(labelText: 'Description *'),
                validator: (v) => v?.isEmpty == true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(labelText: 'Service Category'),
                items: const [
                  DropdownMenuItem(value: 'cat_electrical', child: Text('⚡ Electrical')),
                  DropdownMenuItem(value: 'cat_plumbing', child: Text('💧 Plumbing')),
                  DropdownMenuItem(value: 'cat_security', child: Text('🛡️ Security')),
                  DropdownMenuItem(value: 'cat_event', child: Text('📋 Event Services')),
                  DropdownMenuItem(value: 'cat_general', child: Text('🔧 General Labour')),
                ],
                onChanged: (v) => setState(() => _category = v ?? 'cat_electrical'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _skillCtrl,
                decoration: const InputDecoration(labelText: 'Required Skill'),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Workers Needed: $_workersNeeded',
                            style: const TextStyle(fontWeight: FontWeight.w500)),
                        Slider(
                          value: _workersNeeded.toDouble(),
                          min: 1,
                          max: 200,
                          divisions: 199,
                          onChanged: (v) => setState(() => _workersNeeded = v.toInt()),
                          activeColor: TrustGridColors.primary,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Min Trust Score: ${_minTrustScore.toInt()}',
                            style: const TextStyle(fontWeight: FontWeight.w500)),
                        Slider(
                          value: _minTrustScore,
                          min: 0,
                          max: 90,
                          divisions: 9,
                          onChanged: (v) => setState(() => _minTrustScore = v),
                          activeColor: TrustGridColors.warning,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _priority,
                decoration: const InputDecoration(labelText: 'Priority'),
                items: const [
                  DropdownMenuItem(value: 'LOW', child: Text('Low')),
                  DropdownMenuItem(value: 'NORMAL', child: Text('Normal')),
                  DropdownMenuItem(value: 'HIGH', child: Text('High')),
                  DropdownMenuItem(value: 'CRITICAL', child: Text('Critical')),
                ],
                onChanged: (v) => setState(() => _priority = v ?? 'NORMAL'),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _locationCtrl,
                decoration: const InputDecoration(labelText: 'Location'),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                      : const Text('Create & Find Matching Workers'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);

    try {
      final api = ref.read(apiClientProvider);
      final response = await api.post('/service-requests', data: {
        'title': _titleCtrl.text,
        'description': _descCtrl.text,
        'categoryId': _category,
        'requiredSkills': [_skillCtrl.text],
        'workersNeeded': _workersNeeded,
        'minimumTrustScore': _minTrustScore.toInt(),
        'locationAddress': _locationCtrl.text,
        'priority': _priority,
      });

      final requestId = (response.data as Map<String, dynamic>)['id'] as String;

      // Auto-submit
      await api.post('/service-requests/$requestId/submit');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Service request created!'),
            backgroundColor: TrustGridColors.secondary,
          ),
        );
        context.go('/service-requests/$requestId');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: TrustGridColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}
