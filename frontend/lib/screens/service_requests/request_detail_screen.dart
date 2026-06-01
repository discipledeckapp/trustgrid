import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

final requestDetailProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, id) async {
    final api = ref.read(apiClientProvider);
    final response = await api.get('/service-requests/$id');
    return response.data as Map<String, dynamic>;
  },
);

final matchedWorkersProvider = FutureProvider.family<List<dynamic>, String>(
  (ref, id) async {
    final api = ref.read(apiClientProvider);
    final response = await api.get('/service-requests/$id/matched-workers');
    return response.data as List;
  },
);

class RequestDetailScreen extends ConsumerStatefulWidget {
  final String requestId;
  const RequestDetailScreen({super.key, required this.requestId});

  @override
  ConsumerState<RequestDetailScreen> createState() => _RequestDetailScreenState();
}

class _RequestDetailScreenState extends ConsumerState<RequestDetailScreen> {
  final Set<String> _selectedWorkerIds = {};
  bool _assigning = false;

  @override
  Widget build(BuildContext context) {
    final requestAsync = ref.watch(requestDetailProvider(widget.requestId));
    final matchedAsync = ref.watch(matchedWorkersProvider(widget.requestId));

    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('Service Request'),
        actions: [
          if (_selectedWorkerIds.isNotEmpty)
            TextButton.icon(
              icon: const Icon(Icons.check, color: Colors.white),
              label: Text('Assign ${_selectedWorkerIds.length}', style: const TextStyle(color: Colors.white)),
              onPressed: _assigning ? null : _assignSelected,
            ),
        ],
      ),
      body: requestAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (request) => CustomScrollView(
          slivers: [
            SliverToBoxAdapter(child: _buildRequestDetails(request)),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Matching Workers',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        if (_selectedWorkerIds.isNotEmpty)
                          Text(
                            '${_selectedWorkerIds.length} selected',
                            style: const TextStyle(color: TrustGridColors.primary, fontWeight: FontWeight.w600),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Workers filtered by skill + min trust score ${request['minimumTrustScore'] ?? 0}',
                      style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
            matchedAsync.when(
              loading: () => const SliverToBoxAdapter(
                child: Center(child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                )),
              ),
              error: (e, _) => SliverToBoxAdapter(child: Center(child: Text('Error: $e'))),
              data: (workers) => SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, i) {
                    final w = workers[i] as Map<String, dynamic>;
                    final workerId = w['id'] as String;
                    final selected = _selectedWorkerIds.contains(workerId);
                    return _MatchedWorkerRow(
                      worker: w,
                      selected: selected,
                      onToggle: () => setState(() {
                        if (selected) {
                          _selectedWorkerIds.remove(workerId);
                        } else {
                          _selectedWorkerIds.add(workerId);
                        }
                      }),
                    );
                  },
                  childCount: workers.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 80)),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestDetails(Map<String, dynamic> request) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              request['title'] as String? ?? '',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              request['description'] as String? ?? '',
              style: const TextStyle(color: TrustGridColors.textSecondary),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _chip(Icons.people, '${request['workersNeeded']} workers'),
                _chip(Icons.shield, 'Trust ≥ ${request['minimumTrustScore'] ?? 0}'),
                _chip(Icons.flag, request['priority'] as String? ?? ''),
                _chip(Icons.info, request['status'] as String? ?? ''),
              ],
            ),
            if (request['locationAddress'] != null) ...[
              const SizedBox(height: 8),
              Row(children: [
                const Icon(Icons.location_on_outlined, size: 14, color: TrustGridColors.textMuted),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    request['locationAddress'] as String,
                    style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 12),
                  ),
                ),
              ]),
            ],
          ],
        ),
      ),
    );
  }

  Widget _chip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: TrustGridColors.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: TrustGridColors.primary),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: TrustGridColors.primary)),
        ],
      ),
    );
  }

  Future<void> _assignSelected() async {
    if (_selectedWorkerIds.isEmpty) return;
    setState(() => _assigning = true);

    try {
      final api = ref.read(apiClientProvider);
      await api.post('/service-requests/${widget.requestId}/assign', data: {
        'workerIds': _selectedWorkerIds.toList(),
      });

      ref.refresh(requestDetailProvider(widget.requestId));
      setState(() => _selectedWorkerIds.clear());

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Workers assigned successfully!'),
            backgroundColor: TrustGridColors.secondary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: TrustGridColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _assigning = false);
    }
  }
}

class _MatchedWorkerRow extends StatelessWidget {
  final Map<String, dynamic> worker;
  final bool selected;
  final VoidCallback onToggle;

  const _MatchedWorkerRow({
    required this.worker,
    required this.selected,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final gradeColor = Color(
      int.parse('FF${(worker['trustGradeColor'] as String? ?? '#64748B').replaceAll('#', '')}', radix: 16),
    );
    final isVerified = worker['verificationStatus'] == 'FULLY_VERIFIED';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Card(
        color: selected ? TrustGridColors.primary.withOpacity(0.05) : null,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: selected
              ? const BorderSide(color: TrustGridColors.primary, width: 2)
              : BorderSide.none,
        ),
        child: InkWell(
          onTap: onToggle,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Checkbox(
                  value: selected,
                  onChanged: (_) => onToggle(),
                  activeColor: TrustGridColors.primary,
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 20,
                  backgroundColor: TrustGridColors.primary.withOpacity(0.1),
                  child: Text(
                    (worker['firstName'] as String? ?? 'W').substring(0, 1),
                    style: const TextStyle(color: TrustGridColors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            '${worker['firstName']} ${worker['lastName']}',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          if (isVerified) ...[
                            const SizedBox(width: 4),
                            const Icon(Icons.verified, size: 14, color: TrustGridColors.secondary),
                          ],
                        ],
                      ),
                      Text(
                        worker['primarySkill'] as String? ?? '',
                        style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: gradeColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '${worker['trustGrade']}  ${(worker['trustScore'] as num).toStringAsFixed(1)}',
                        style: TextStyle(
                          color: gradeColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                    if (worker['averageRating'] != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        '⭐ ${(worker['averageRating'] as num).toStringAsFixed(1)}',
                        style: const TextStyle(fontSize: 11, color: TrustGridColors.textSecondary),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
