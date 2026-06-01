import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../features/community/community_select_screen.dart';
import '../features/community/community_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/workforce/worker_list_screen.dart';
import '../screens/workforce/worker_profile_screen.dart';
import '../screens/workforce/add_worker_screen.dart';
import '../screens/service_requests/service_request_list_screen.dart';
import '../screens/service_requests/create_request_screen.dart';
import '../screens/service_requests/request_detail_screen.dart';
import '../screens/incidents/incident_list_screen.dart';
import '../screens/incidents/report_incident_screen.dart';
import '../screens/analytics/analytics_screen.dart';
import '../screens/worker_app/worker_home_screen.dart';
import '../screens/worker_app/worker_assignments_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    debugLogDiagnostics: false,
    redirect: (context, state) async {
      // Always allow the community select screen through
      if (state.matchedLocation == '/community') return null;

      final prefs = await SharedPreferences.getInstance();
      final hasCommunity = prefs.containsKey('community_slug');
      if (!hasCommunity) return '/community';

      return null;
    },
    routes: [
      // Community onboarding
      GoRoute(
        path: '/community',
        builder: (context, state) => const CommunitySelectScreen(),
      ),

      // Auth
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),

      // Admin / Operator shell
      ShellRoute(
        builder: (context, state, child) => AdminShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/workers',
            builder: (context, state) => const WorkerListScreen(),
          ),
          GoRoute(
            path: '/workers/add',
            builder: (context, state) => const AddWorkerScreen(),
          ),
          GoRoute(
            path: '/workers/:id',
            builder: (context, state) => WorkerProfileScreen(
              workerId: state.pathParameters['id']!,
            ),
          ),
          GoRoute(
            path: '/service-requests',
            builder: (context, state) => const ServiceRequestListScreen(),
          ),
          GoRoute(
            path: '/service-requests/create',
            builder: (context, state) => const CreateRequestScreen(),
          ),
          GoRoute(
            path: '/service-requests/:id',
            builder: (context, state) => RequestDetailScreen(
              requestId: state.pathParameters['id']!,
            ),
          ),
          GoRoute(
            path: '/incidents',
            builder: (context, state) => const IncidentListScreen(),
          ),
          GoRoute(
            path: '/incidents/report',
            builder: (context, state) => const ReportIncidentScreen(),
          ),
          GoRoute(
            path: '/analytics',
            builder: (context, state) => const AnalyticsScreen(),
          ),
        ],
      ),

      // Worker app shell
      ShellRoute(
        builder: (context, state, child) => WorkerShell(child: child),
        routes: [
          GoRoute(
            path: '/worker/home',
            builder: (context, state) => const WorkerHomeScreen(),
          ),
          GoRoute(
            path: '/worker/assignments',
            builder: (context, state) => const WorkerAssignmentsScreen(),
          ),
        ],
      ),
    ],
  );
});

class AdminShell extends ConsumerWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: Row(
        children: [
          if (MediaQuery.of(context).size.width > 800) _buildSidebar(context, ref),
          Expanded(child: child),
        ],
      ),
      bottomNavigationBar: MediaQuery.of(context).size.width <= 800
          ? _buildBottomNav(context, ref)
          : null,
    );
  }

  Widget _buildSidebar(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    final brand = ref.watch(effectiveBrandProvider);
    final sidebarColor = brand.found ? brand.primaryColor : const Color(0xFF1E40AF);
    return Container(
      width: 240,
      decoration: BoxDecoration(
        color: sidebarColor,
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 48),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  brand.displayName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Governance Dashboard',
                  style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          _navItem(context, '/dashboard', Icons.dashboard_outlined, 'Dashboard', location),
          _navItem(context, '/workers', Icons.people_outline, 'Workforce Registry', location),
          _navItem(context, '/service-requests', Icons.assignment_outlined, 'Service Requests', location),
          _navItem(context, '/incidents', Icons.warning_amber_outlined, 'Incidents', location),
          _navItem(context, '/analytics', Icons.bar_chart_outlined, 'Analytics', location),
          const Spacer(),
          const Divider(color: Colors.white24),
          _navItem(context, '/login', Icons.logout_outlined, 'Logout', location),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _navItem(BuildContext context, String route, IconData icon, String label, String location) {
    final isActive = location.startsWith(route) && route != '/login';
    return InkWell(
      onTap: () => context.go(route),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: isActive ? Colors.white.withOpacity(0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, color: isActive ? Colors.white : Colors.white70, size: 20),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                color: isActive ? Colors.white : Colors.white70,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).matchedLocation;
    final brand = ref.watch(effectiveBrandProvider);
    final activeColor = brand.found ? brand.primaryColor : const Color(0xFF1E40AF);
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: activeColor,
      unselectedItemColor: Colors.grey,
      currentIndex: _getIndex(location),
      onTap: (i) {
        const routes = ['/dashboard', '/workers', '/service-requests', '/incidents', '/analytics'];
        context.go(routes[i]);
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
        BottomNavigationBarItem(icon: Icon(Icons.people_outline), label: 'Workers'),
        BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: 'Requests'),
        BottomNavigationBarItem(icon: Icon(Icons.warning_amber_outlined), label: 'Incidents'),
        BottomNavigationBarItem(icon: Icon(Icons.bar_chart_outlined), label: 'Analytics'),
      ],
    );
  }

  int _getIndex(String location) {
    if (location.startsWith('/workers')) return 1;
    if (location.startsWith('/service-requests')) return 2;
    if (location.startsWith('/incidents')) return 3;
    if (location.startsWith('/analytics')) return 4;
    return 0;
  }
}

class WorkerShell extends StatelessWidget {
  final Widget child;
  const WorkerShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        selectedItemColor: const Color(0xFF1E40AF),
        unselectedItemColor: Colors.grey,
        currentIndex: location.startsWith('/worker/assignments') ? 1 : 0,
        onTap: (i) {
          const routes = ['/worker/home', '/worker/assignments'];
          context.go(routes[i]);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.work_outline), label: 'My Jobs'),
        ],
      ),
    );
  }
}
