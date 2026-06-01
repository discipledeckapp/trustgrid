import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

final dashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.get('/analytics/dashboard');
  return response.data as Map<String, dynamic>;
});

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('Dashboard'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(dashboardProvider),
          ),
        ],
      ),
      body: dashboardAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: TrustGridColors.danger),
              const SizedBox(height: 16),
              Text('Failed to load dashboard', style: TextStyle(color: TrustGridColors.textSecondary)),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.refresh(dashboardProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (data) => _buildDashboard(context, data),
      ),
    );
  }

  Widget _buildDashboard(BuildContext context, Map<String, dynamic> data) {
    final workforce = data['workforce'] as Map<String, dynamic>? ?? {};
    final serviceRequests = data['serviceRequests'] as Map<String, dynamic>? ?? {};
    final incidents = data['incidents'] as Map<String, dynamic>? ?? {};
    final topWorkers = data['topWorkers'] as List? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Workforce Overview',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: TrustGridColors.textPrimary),
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: MediaQuery.of(context).size.width > 600 ? 4 : 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              _statCard(
                'Total Workers',
                workforce['totalWorkers']?.toString() ?? '0',
                Icons.people_outline,
                TrustGridColors.primary,
              ),
              _statCard(
                'Verified',
                workforce['verifiedWorkers']?.toString() ?? '0',
                Icons.verified_outlined,
                TrustGridColors.secondary,
              ),
              _statCard(
                'Avg Trust Score',
                workforce['averageTrustScore']?.toString() ?? '0',
                Icons.star_outline,
                TrustGridColors.warning,
              ),
              _statCard(
                'Available Now',
                workforce['availableWorkers']?.toString() ?? '0',
                Icons.check_circle_outline,
                Colors.teal,
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(child: _serviceRequestCard(serviceRequests)),
              const SizedBox(width: 16),
              Expanded(child: _incidentCard(incidents)),
            ],
          ),
          const SizedBox(height: 24),
          const Text(
            'Top Trusted Workers',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: TrustGridColors.textPrimary),
          ),
          const SizedBox(height: 12),
          ...topWorkers.map((w) => _topWorkerRow(context, w as Map<String, dynamic>)),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: color, size: 24),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color),
                ),
                Text(
                  label,
                  style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _serviceRequestCard(Map<String, dynamic> data) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Icon(Icons.assignment_outlined, color: TrustGridColors.primary, size: 20),
              const SizedBox(width: 8),
              const Text('Service Requests', style: TextStyle(fontWeight: FontWeight.w600)),
            ]),
            const SizedBox(height: 12),
            _dataRow('This month', data['totalThisMonth']?.toString() ?? '0'),
            _dataRow('Completed', data['completedThisMonth']?.toString() ?? '0'),
            _dataRow('In progress', data['inProgress']?.toString() ?? '0'),
          ],
        ),
      ),
    );
  }

  Widget _incidentCard(Map<String, dynamic> data) {
    final hasOpen = (data['openCount'] as int? ?? 0) > 0;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(Icons.warning_amber_outlined,
                  color: hasOpen ? TrustGridColors.danger : TrustGridColors.secondary, size: 20),
              const SizedBox(width: 8),
              const Text('Incidents', style: TextStyle(fontWeight: FontWeight.w600)),
            ]),
            const SizedBox(height: 12),
            _dataRow('Open', data['openCount']?.toString() ?? '0',
                color: hasOpen ? TrustGridColors.danger : null),
            _dataRow('Resolved this month', data['resolvedThisMonth']?.toString() ?? '0'),
            _dataRow('Critical open', data['criticalOpen']?.toString() ?? '0',
                color: (data['criticalOpen'] as int? ?? 0) > 0 ? TrustGridColors.danger : null),
          ],
        ),
      ),
    );
  }

  Widget _dataRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
              color: color ?? TrustGridColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _topWorkerRow(BuildContext context, Map<String, dynamic> worker) {
    final score = (worker['trustScore'] as num?)?.toDouble() ?? 0;
    final grade = worker['trustGrade'] as String? ?? 'F';
    final gradeColor = Color(
      int.parse('FF${(worker['trustGradeColor'] as String? ?? '#64748B').replaceAll('#', '')}', radix: 16),
    );

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: () => context.push('/workers/${worker['id']}'),
        leading: CircleAvatar(
          backgroundColor: TrustGridColors.primary.withOpacity(0.1),
          child: Text(
            (worker['name'] as String? ?? 'W').substring(0, 1),
            style: const TextStyle(color: TrustGridColors.primary, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(worker['name'] as String? ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(worker['primarySkill'] as String? ?? ''),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: gradeColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '$grade  ${score.toStringAsFixed(1)}',
                style: TextStyle(
                  color: gradeColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
