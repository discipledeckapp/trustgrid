import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

final workerProfileProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, workerId) async {
    final api = ref.read(apiClientProvider);
    final response = await api.get('/workers/$workerId');
    return response.data as Map<String, dynamic>;
  },
);

final trustScoreProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, workerId) async {
    final api = ref.read(apiClientProvider);
    final response = await api.get('/workers/$workerId/trust-score');
    return response.data as Map<String, dynamic>;
  },
);

class WorkerProfileScreen extends ConsumerWidget {
  final String workerId;
  const WorkerProfileScreen({super.key, required this.workerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(workerProfileProvider(workerId));

    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('Worker Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.thumb_up_outlined),
            onPressed: () => _showEndorseDialog(context, ref),
            tooltip: 'Endorse Worker',
          ),
        ],
      ),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (worker) => _buildProfile(context, ref, worker),
      ),
    );
  }

  Widget _buildProfile(BuildContext context, WidgetRef ref, Map<String, dynamic> worker) {
    final trustScore = (worker['trustScore'] as num?)?.toDouble() ?? 0;
    final gradeColor = _hexColor(worker['trustGradeColor'] as String? ?? '#64748B');
    final isVerified = worker['identityVerified'] as bool? ?? false;

    return SingleChildScrollView(
      child: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            color: TrustGridColors.primary,
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: Colors.white.withOpacity(0.2),
                  child: Text(
                    (worker['firstName'] as String? ?? 'W').substring(0, 1),
                    style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  '${worker['firstName']} ${worker['lastName']}',
                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      worker['primarySkill'] as String? ?? '',
                      style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14),
                    ),
                    if (isVerified) ...[
                      const SizedBox(width: 8),
                      const Icon(Icons.verified, color: Colors.white, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        'Verified',
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),

          // Trust Score Card
          Padding(
            padding: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Trust Score',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: gradeColor.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${worker['trustGrade']}  ${trustScore.toStringAsFixed(1)}',
                            style: TextStyle(
                              color: gradeColor,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: trustScore / 100,
                        minHeight: 10,
                        backgroundColor: gradeColor.withOpacity(0.15),
                        valueColor: AlwaysStoppedAnimation<Color>(gradeColor),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _trustStat('Deployments', '${worker['totalDeployments'] ?? 0}'),
                        _trustStat('Rating', worker['averageRating'] != null
                            ? '${(worker['averageRating'] as num).toStringAsFixed(1)} ⭐'
                            : 'N/A'),
                        _trustStat('Endorsed By', '${worker['totalEndorsements'] ?? 0}'),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Stats
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Profile Details', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 12),
                    if (worker['bio'] != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Text(
                          worker['bio'] as String,
                          style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 14),
                        ),
                      ),
                    _detailRow('Skills', (worker['skills'] as List?)?.join(', ') ?? ''),
                    _detailRow('Experience', '${worker['yearsExperience'] ?? 'N/A'} years'),
                    _detailRow('Worker Type', worker['workerType'] as String? ?? ''),
                    if (worker['dailyRate'] != null)
                      _detailRow('Daily Rate', '₦${worker['dailyRate']}'),
                    _detailRow('Availability',
                        (worker['isAvailable'] as bool? ?? false) ? '✓ Available' : '✗ Not Available'),
                    _detailRow('Verification', worker['verificationStatus'] as String? ?? ''),
                    _detailRow('Incident History',
                        '${(worker['incidentHistory'] as Map?)?['total'] ?? 0} total, ${(worker['incidentHistory'] as Map?)?['open'] ?? 0} open'),
                  ],
                ),
              ),
            ),
          ),

          // Endorsements
          if ((worker['endorsements'] as List?)?.isNotEmpty == true) ...[
            Padding(
              padding: const EdgeInsets.all(16),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Endorsements', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                      const SizedBox(height: 12),
                      ...(worker['endorsements'] as List).map((e) => _endorsementItem(e as Map<String, dynamic>)),
                    ],
                  ),
                ),
              ),
            ),
          ],

          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _trustStat(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        Text(label, style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 12)),
      ],
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _endorsementItem(Map<String, dynamic> e) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.format_quote, color: TrustGridColors.primary, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (e['comment'] != null)
                  Text(e['comment'] as String, style: const TextStyle(fontSize: 13)),
                const SizedBox(height: 4),
                Text(
                  '— ${e['endorserName']}${e['endorserRole'] != null ? ', ${e['endorserRole']}' : ''}',
                  style: const TextStyle(
                    color: TrustGridColors.textSecondary,
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _hexColor(String hex) {
    try {
      return Color(int.parse('FF${hex.replaceAll('#', '')}', radix: 16));
    } catch (_) {
      return TrustGridColors.textMuted;
    }
  }

  void _showEndorseDialog(BuildContext context, WidgetRef ref) {
    final nameCtrl = TextEditingController();
    final roleCtrl = TextEditingController();
    final commentCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Endorse Worker'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Your Name')),
            const SizedBox(height: 12),
            TextField(controller: roleCtrl, decoration: const InputDecoration(labelText: 'Your Role')),
            const SizedBox(height: 12),
            TextField(
              controller: commentCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Comment'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final api = ref.read(apiClientProvider);
              await api.post('/workers/$workerId/endorsements', data: {
                'endorserName': nameCtrl.text,
                'endorserRole': roleCtrl.text,
                'comment': commentCtrl.text,
              });
              ref.refresh(workerProfileProvider(workerId));
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('Endorse'),
          ),
        ],
      ),
    );
  }
}
