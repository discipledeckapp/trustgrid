import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:app_links/app_links.dart'; // ignore: unused_import
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Deep link handling is initialized by GoRouter via routeInformationProvider.
  // app_links package handles the native URL scheme registration.
  runApp(const ProviderScope(child: TrustGridApp()));
}
