import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';
import '../../models/worker_profile.dart';

final workersProvider = FutureProvider.family<Map<String, dynamic>, Map<String, dynamic>>(
  (ref, filters) async {
    final api = ref.read(apiClientProvider);
    final response = await api.get('/workers', queryParameters: filters);
    return response.data as Map<String, dynamic>;
  },
);

class WorkerListScreen extends ConsumerStatefulWidget {
  const WorkerListScreen({super.key});

  @override
  ConsumerState<WorkerListScreen> createState() => _WorkerListScreenState();
}

class _WorkerListScreenState extends ConsumerState<WorkerListScreen> {
  String? _skillFilter;
  double _minTrustScore = 0;
  String? _verificationFilter;
  bool _availableOnly = false;
  final _searchController = TextEditingController();

  Map<String, dynamic> get _filters {
    final f = <String, dynamic>{
      'sortBy': 'trustScore',
      'sortOrder': 'desc',
      'limit': 50,
    };
    if (_skillFilter != null && _skillFilter!.isNotEmpty) f['skill'] = _skillFilter;
    if (_minTrustScore > 0) f['minTrustScore'] = _minTrustScore.toInt();
    if (_verificationFilter != null) f['verificationStatus'] = _verificationFilter;
    if (_availableOnly) f['isAvailable'] = 'true';
    if (_searchController.text.isNotEmpty) f['search'] = _searchController.text;
    return f;
  }

  @override
  Widget build(BuildContext context) {
    final workersAsync = ref.watch(workersProvider(_filters));

    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('Workforce Registry'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_outlined),
            onPressed: () => context.go('/workers/add'),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(workersProvider(_filters)),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildFilters(),
          Expanded(
            child: workersAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (data) {
                final workers = (data['data'] as List? ?? [])
                    .map((w) => WorkerProfile.fromJson(w as Map<String, dynamic>))
                    .toList();
                final total = (data['pagination'] as Map<String, dynamic>?)?['total'] ?? 0;

                return Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          Text(
                            '$total workers found',
                            style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: workers.length,
                        itemBuilder: (context, index) => _WorkerCard(worker: workers[index]),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search workers...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {});
                      },
                    )
                  : null,
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _FilterChip(
                  label: 'Electrician',
                  selected: _skillFilter == 'Electrician',
                  onSelected: (v) => setState(() => _skillFilter = v ? 'Electrician' : null),
                ),
                _FilterChip(
                  label: 'Plumber',
                  selected: _skillFilter == 'Plumber',
                  onSelected: (v) => setState(() => _skillFilter = v ? 'Plumber' : null),
                ),
                _FilterChip(
                  label: 'Security',
                  selected: _skillFilter == 'Security Guard',
                  onSelected: (v) => setState(() => _skillFilter = v ? 'Security Guard' : null),
                ),
                _FilterChip(
                  label: 'Verified Only',
                  selected: _verificationFilter == 'FULLY_VERIFIED',
                  onSelected: (v) => setState(
                    () => _verificationFilter = v ? 'FULLY_VERIFIED' : null,
                  ),
                  color: TrustGridColors.secondary,
                ),
                _FilterChip(
                  label: 'Available',
                  selected: _availableOnly,
                  onSelected: (v) => setState(() => _availableOnly = v),
                  color: Colors.teal,
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Min Trust: ${_minTrustScore.toInt()}',
                      style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                    ),
                    SizedBox(
                      width: 120,
                      child: Slider(
                        value: _minTrustScore,
                        min: 0,
                        max: 90,
                        divisions: 9,
                        onChanged: (v) => setState(() => _minTrustScore = v),
                        activeColor: TrustGridColors.primary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final ValueChanged<bool> onSelected;
  final Color? color;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onSelected,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final c = color ?? TrustGridColors.primary;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: onSelected,
        selectedColor: c.withOpacity(0.15),
        checkmarkColor: c,
        labelStyle: TextStyle(
          color: selected ? c : TrustGridColors.textSecondary,
          fontSize: 13,
          fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}

class _WorkerCard extends StatelessWidget {
  final WorkerProfile worker;
  const _WorkerCard({required this.worker});

  @override
  Widget build(BuildContext context) {
    final gradeColor = Color(
      int.parse('FF${worker.trustGradeColor.replaceAll('#', '')}', radix: 16),
    );

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => context.push('/workers/${worker.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Avatar
              CircleAvatar(
                radius: 26,
                backgroundColor: TrustGridColors.primary.withOpacity(0.1),
                child: Text(
                  worker.firstName.substring(0, 1),
                  style: const TextStyle(
                    color: TrustGridColors.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          worker.fullName,
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                        ),
                        if (worker.isVerified) ...[
                          const SizedBox(width: 6),
                          const Icon(Icons.verified, color: TrustGridColors.secondary, size: 16),
                        ],
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      worker.primarySkill,
                      style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (worker.averageRating != null) ...[
                          const Icon(Icons.star, size: 13, color: TrustGridColors.warning),
                          const SizedBox(width: 2),
                          Text(
                            worker.averageRating!.toStringAsFixed(1),
                            style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                          ),
                          const SizedBox(width: 8),
                        ],
                        Icon(Icons.work_outline, size: 13, color: TrustGridColors.textMuted),
                        const SizedBox(width: 2),
                        Text(
                          '${worker.totalDeployments} jobs',
                          style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              // Trust score badge
              Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: gradeColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Column(
                      children: [
                        Text(
                          worker.trustGrade,
                          style: TextStyle(
                            color: gradeColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          worker.trustScore.toStringAsFixed(1),
                          style: TextStyle(color: gradeColor, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  if (worker.isAvailable) ...[
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: TrustGridColors.secondary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Available',
                        style: TextStyle(
                          color: TrustGridColors.secondary,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
