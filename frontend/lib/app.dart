import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/router.dart';
import 'config/theme.dart';
import 'features/community/community_provider.dart';

class TrustGridApp extends ConsumerWidget {
  const TrustGridApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final brand = ref.watch(effectiveBrandProvider);

    final theme = brand.found
        ? TrustGridTheme.communityTheme(
            primaryColor: brand.primaryColor,
            accentColor: brand.accentColor,
          )
        : TrustGridTheme.light;

    return MaterialApp.router(
      title: brand.appName,
      theme: theme,
      darkTheme: TrustGridTheme.dark,
      themeMode: ThemeMode.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
