import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

final analyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final [dashboard, distribution] = await Future.wait([
    api.get('/analytics/dashboard'),
    api.get('/analytics/trust-distribution'),
  ]);
  return {
    'dashboard': dashboard.data,
    'distribution': distribution.data,
  };
});

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analyticsAsync = ref.watch(analyticsProvider);

    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('Analytics'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(analyticsProvider),
          ),
        ],
      ),
      body: analyticsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (data) {
          final distribution = data['distribution'] as Map<String, dynamic>;
          final distList = distribution['distribution'] as List? ?? [];

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Trust Score Distribution',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  '${distribution['workforce']} workers · Avg: ${distribution['averageScore']} · Median: ${distribution['medianScore']}',
                  style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13),
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: distList.map((item) {
                        final d = item as Map<String, dynamic>;
                        final pct = (d['percentage'] as num).toDouble();
                        return _DistributionRow(
                          range: d['range'] as String,
                          count: d['count'] as int,
                          percentage: pct,
                          color: _rangeColor(d['range'] as String),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 80),
              ],
            ),
          );
        },
      ),
    );
  }

  Color _rangeColor(String range) {
    if (range.startsWith('90')) return TrustGridColors.gradeAPlus;
    if (range.startsWith('80')) return TrustGridColors.gradeA;
    if (range.startsWith('70')) return TrustGridColors.gradeBPlus;
    if (range.startsWith('60')) return TrustGridColors.gradeB;
    if (range.startsWith('50')) return TrustGridColors.gradeC;
    return TrustGridColors.gradeF;
  }
}

class _DistributionRow extends StatelessWidget {
  final String range;
  final int count;
  final double percentage;
  final Color color;

  const _DistributionRow({
    required this.range,
    required this.count,
    required this.percentage,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 60,
            child: Text(range, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Stack(
              children: [
                Container(
                  height: 24,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                FractionallySizedBox(
                  widthFactor: percentage / 100,
                  child: Container(
                    height: 24,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 70,
            child: Text(
              '$count (${percentage.toStringAsFixed(1)}%)',
              style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}
