import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../services/api_client.dart';
import '../../config/theme.dart';

final serviceRequestsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.get('/service-requests');
  return response.data as Map<String, dynamic>;
});

class ServiceRequestListScreen extends ConsumerWidget {
  const ServiceRequestListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(serviceRequestsProvider);

    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('Service Requests'),
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.go('/service-requests/create'),
          ),
        ],
      ),
      body: requestsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (data) {
          final requests = data['data'] as List? ?? [];
          if (requests.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.assignment_outlined, size: 64, color: TrustGridColors.textMuted),
                  const SizedBox(height: 16),
                  const Text('No service requests yet',
                      style: TextStyle(color: TrustGridColors.textSecondary, fontSize: 16)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.add),
                    label: const Text('Create Request'),
                    onPressed: () => context.go('/service-requests/create'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: requests.length,
            itemBuilder: (context, i) {
              final req = requests[i] as Map<String, dynamic>;
              return _RequestCard(request: req);
            },
          );
        },
      ),
    );
  }
}

class _RequestCard extends StatelessWidget {
  final Map<String, dynamic> request;
  const _RequestCard({required this.request});

  @override
  Widget build(BuildContext context) {
    final status = request['status'] as String? ?? '';
    final statusColor = _statusColor(status);

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: InkWell(
        onTap: () => context.push('/service-requests/${request['id']}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      request['title'] as String? ?? '',
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                request['description'] as String? ?? '',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.people_outline, size: 14, color: TrustGridColors.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    '${request['workersNeeded']} workers needed',
                    style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                  ),
                  if (request['minimumTrustScore'] != null) ...[
                    const SizedBox(width: 12),
                    const Icon(Icons.shield_outlined, size: 14, color: TrustGridColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      'Min trust: ${request['minimumTrustScore']}',
                      style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary),
                    ),
                  ],
                  const Spacer(),
                  Text(
                    request['priority'] as String? ?? '',
                    style: TextStyle(
                      fontSize: 11,
                      color: (request['priority'] == 'HIGH' || request['priority'] == 'CRITICAL')
                          ? TrustGridColors.danger
                          : TrustGridColors.textMuted,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'DRAFT': return TrustGridColors.textMuted;
      case 'SUBMITTED': return TrustGridColors.primary;
      case 'ASSIGNED': return TrustGridColors.warning;
      case 'IN_PROGRESS': return Colors.teal;
      case 'COMPLETED': return TrustGridColors.secondary;
      case 'CANCELLED': return TrustGridColors.danger;
      default: return TrustGridColors.textMuted;
    }
  }
}
