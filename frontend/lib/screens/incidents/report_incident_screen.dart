import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

class ReportIncidentScreen extends ConsumerStatefulWidget {
  const ReportIncidentScreen({super.key});

  @override
  ConsumerState<ReportIncidentScreen> createState() => _ReportIncidentScreenState();
}

class _ReportIncidentScreenState extends ConsumerState<ReportIncidentScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _workerIdCtrl = TextEditingController();
  String _severity = 'MEDIUM';
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Report Incident')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Incident details will be investigated. The worker\'s trust score will be affected during investigation.',
              style: TextStyle(color: TrustGridColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _workerIdCtrl,
              decoration: const InputDecoration(labelText: 'Worker ID (optional)'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _titleCtrl,
              decoration: const InputDecoration(labelText: 'Incident Title *'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _descCtrl,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'Description *'),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _severity,
              decoration: const InputDecoration(labelText: 'Severity'),
              items: const [
                DropdownMenuItem(value: 'LOW', child: Text('Low')),
                DropdownMenuItem(value: 'MEDIUM', child: Text('Medium')),
                DropdownMenuItem(value: 'HIGH', child: Text('High')),
                DropdownMenuItem(value: 'CRITICAL', child: Text('Critical')),
              ],
              onChanged: (v) => setState(() => _severity = v ?? 'MEDIUM'),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: TrustGridColors.danger),
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                    : const Text('Report Incident'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (_titleCtrl.text.isEmpty || _descCtrl.text.isEmpty) return;
    setState(() => _loading = true);

    try {
      final api = ref.read(apiClientProvider);
      await api.post('/incidents', data: {
        'title': _titleCtrl.text,
        'description': _descCtrl.text,
        'severity': _severity,
        'incidentDate': DateTime.now().toIso8601String(),
        if (_workerIdCtrl.text.isNotEmpty) 'workerId': _workerIdCtrl.text,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Incident reported'),
            backgroundColor: TrustGridColors.warning,
          ),
        );
        context.go('/incidents');
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
