import 'package:flutter/material.dart';
import '../../config/theme.dart';

class WorkerAssignmentsScreen extends StatelessWidget {
  const WorkerAssignmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      appBar: AppBar(
        title: const Text('My Jobs'),
        automaticallyImplyLeading: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'ACTIVE',
            style: TextStyle(
              color: TrustGridColors.textSecondary,
              fontSize: 11,
              letterSpacing: 1,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          _AssignmentCard(
            title: 'RCCG Convention 2026',
            subtitle: 'Stage & Generator Systems',
            dates: 'May 15–18, 2026',
            status: 'ACCEPTED',
            statusColor: TrustGridColors.secondary,
          ),
          const SizedBox(height: 16),
          const Text(
            'COMPLETED',
            style: TextStyle(
              color: TrustGridColors.textSecondary,
              fontSize: 11,
              letterSpacing: 1,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          _AssignmentCard(
            title: 'Estate Block C Rewiring',
            subtitle: 'Electrical · Redemption City Phase 2',
            dates: 'Apr 10, 2026',
            status: 'COMPLETED',
            statusColor: Colors.teal,
            rating: 5.0,
          ),
          _AssignmentCard(
            title: 'Generator Maintenance',
            subtitle: 'Power Systems · RCCG Admin Block',
            dates: 'Mar 22, 2026',
            status: 'COMPLETED',
            statusColor: Colors.teal,
            rating: 4.0,
          ),
        ],
      ),
    );
  }
}

class _AssignmentCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String dates;
  final String status;
  final Color statusColor;
  final double? rating;

  const _AssignmentCard({
    required this.title,
    required this.subtitle,
    required this.dates,
    required this.status,
    required this.statusColor,
    this.rating,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
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
            const SizedBox(height: 4),
            Text(subtitle, style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 13)),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today_outlined, size: 13, color: TrustGridColors.textMuted),
                const SizedBox(width: 4),
                Text(dates, style: const TextStyle(fontSize: 12, color: TrustGridColors.textSecondary)),
                if (rating != null) ...[
                  const Spacer(),
                  const Icon(Icons.star, size: 14, color: TrustGridColors.warning),
                  const SizedBox(width: 2),
                  Text(
                    rating!.toStringAsFixed(1),
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
