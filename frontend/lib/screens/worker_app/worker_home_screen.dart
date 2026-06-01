import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';

class WorkerHomeScreen extends ConsumerWidget {
  const WorkerHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: TrustGridColors.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Header
              Container(
                width: double.infinity,
                color: TrustGridColors.primary,
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hi, Chukwuemeka 👋',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Electrician · TrustGrid Verified',
                      style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13),
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
                        const Text(
                          'MY TRUST SCORE',
                          style: TextStyle(
                            color: TrustGridColors.textSecondary,
                            fontSize: 11,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Stack(
                          alignment: Alignment.center,
                          children: [
                            SizedBox(
                              height: 120,
                              width: 120,
                              child: CircularProgressIndicator(
                                value: 78.5 / 100,
                                strokeWidth: 10,
                                backgroundColor: TrustGridColors.gradeBPlus.withOpacity(0.2),
                                valueColor: const AlwaysStoppedAnimation(TrustGridColors.gradeBPlus),
                              ),
                            ),
                            Column(
                              children: [
                                const Text(
                                  '78.5',
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.bold,
                                    color: TrustGridColors.textPrimary,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: TrustGridColors.gradeBPlus.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'B+ Good',
                                    style: TextStyle(
                                      color: TrustGridColors.gradeBPlus,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: const [
                            _ScoreStat(value: '23', label: 'Jobs Done'),
                            _ScoreStat(value: '4.6 ⭐', label: 'Avg Rating'),
                            _ScoreStat(value: '5', label: 'Endorsements'),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          '↑ IMPROVING · Top 28% of Electricians',
                          style: TextStyle(
                            color: TrustGridColors.secondary,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // New Assignment
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Card(
                  color: TrustGridColors.primary.withOpacity(0.05),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: TrustGridColors.primary, width: 1.5),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: TrustGridColors.danger,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'NEW JOB',
                                style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const Spacer(),
                            const Text('HIGH', style: TextStyle(color: TrustGridColors.danger, fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'RCCG Convention 2026',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                        ),
                        const SizedBox(height: 4),
                        const Text('Electrician · Stage & Generator Systems'),
                        const SizedBox(height: 8),
                        Row(
                          children: const [
                            Icon(Icons.calendar_today_outlined, size: 14, color: TrustGridColors.textMuted),
                            SizedBox(width: 4),
                            Text('May 15 – 18, 2026', style: TextStyle(fontSize: 13)),
                            SizedBox(width: 16),
                            Icon(Icons.location_on_outlined, size: 14, color: TrustGridColors.textMuted),
                            SizedBox(width: 4),
                            Text('Redemption Camp', style: TextStyle(fontSize: 13)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton(
                                onPressed: () {},
                                child: const Text('Decline'),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              flex: 2,
                              child: ElevatedButton.icon(
                                icon: const Icon(Icons.check),
                                label: const Text('Accept Job'),
                                onPressed: () {},
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }
}

class _ScoreStat extends StatelessWidget {
  final String value;
  final String label;
  const _ScoreStat({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        Text(label, style: const TextStyle(color: TrustGridColors.textSecondary, fontSize: 12)),
      ],
    );
  }
}
