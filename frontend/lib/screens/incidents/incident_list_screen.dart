import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

final incidentsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.get('/incidents');
  return response.data as Map<String, dynamic>;
});

class IncidentListScreen extends ConsumerWidget {
  const IncidentListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final incidentsAsync = ref.watch(incidentsProvider);

    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('Incidents'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/incidents/report'),
          ),
        ],
      ),
      body: incidentsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (data) {
          final incidents = data['data'] as List? ?? [];
          if (incidents.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline, size: 64, color: TrustGridColors.secondary),
                  SizedBox(height: 16),
                  Text('No incidents reported', style: TextStyle(color: TrustGridColors.textSecondary)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: incidents.length,
            itemBuilder: (context, i) {
              final inc = incidents[i] as Map<String, dynamic>;
              return _IncidentCard(incident: inc);
            },
          );
        },
      ),
    );
  }
}

class _IncidentCard extends StatelessWidget {
  final Map<String, dynamic> incident;
  const _IncidentCard({required this.incident});

  @override
  Widget build(BuildContext context) {
    final severity = incident['severity'] as String? ?? 'MEDIUM';
    final status = incident['status'] as String? ?? 'OPEN';
    final severityColor = _severityColor(severity);
    final worker = incident['worker'] as Map<String, dynamic>?;
    final workerUser = worker?['user'] as Map<String, dynamic>?;

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(
                    color: severityColor,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    incident['title'] as String? ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                _statusBadge(status),
              ],
            ),
            const SizedBox(height: 8),
            if (workerUser != null)
              Text(
                'Worker: ${workerUser['firstName']} ${workerUser['lastName']}',
                style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13),
              ),
            const SizedBox(height: 4),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: severityColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    severity,
                    style: TextStyle(color: severityColor, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    final colors = {
      'OPEN': TrustGridColors.danger,
      'RESOLVED': TrustGridColors.secondary,
      'UNDER_INVESTIGATION': TrustGridColors.warning,
      'DISMISSED': TrustGridColors.textMuted,
    };
    final color = colors[status] ?? TrustGridColors.textMuted;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(status, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  Color _severityColor(String severity) {
    switch (severity) {
      case 'LOW': return Colors.blue;
      case 'MEDIUM': return TrustGridColors.warning;
      case 'HIGH': return Colors.deepOrange;
      case 'CRITICAL': return TrustGridColors.danger;
      default: return TrustGridColors.textMuted;
    }
  }
}
