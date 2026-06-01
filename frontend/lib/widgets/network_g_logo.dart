import 'package:flutter/material.dart';

class NetworkGLogo extends StatelessWidget {
  final double size;
  final Color? primaryColor;
  final Color? accentColor;

  const NetworkGLogo({
    super.key,
    this.size = 48,
    this.primaryColor,
    this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _NetworkGPainter(
        primaryColor: primaryColor ?? const Color(0xFF4F46E5),
        accentColor:  accentColor  ?? const Color(0xFF06B6D4),
      ),
    );
  }
}

class _NetworkGPainter extends CustomPainter {
  final Color primaryColor;
  final Color accentColor;

  _NetworkGPainter({required this.primaryColor, required this.accentColor});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.035
      ..strokeCap = StrokeCap.round
      ..shader = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [primaryColor, accentColor],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    final dotPaint = Paint()
      ..style = PaintingStyle.fill
      ..shader = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [primaryColor, accentColor],
      ).createShader(Rect.fromLTWH(0, 0, w, h));

    // Main arc: bottom-left curve (21,80 → 52,92 → 80,80 → 90,50)
    final mainArc = Path()
      ..moveTo(w * 0.21, h * 0.26)
      ..cubicTo(w * 0.12, h * 0.38, w * 0.12, h * 0.62, w * 0.24, h * 0.80)
      ..cubicTo(w * 0.32, h * 0.88, w * 0.42, h * 0.92, w * 0.52, h * 0.92)
      ..cubicTo(w * 0.62, h * 0.92, w * 0.72, h * 0.88, w * 0.80, h * 0.80)
      ..cubicTo(w * 0.88, h * 0.72, w * 0.90, h * 0.62, w * 0.90, h * 0.50);
    canvas.drawPath(mainArc, paint);

    // Top arc (faded): 21,26 → 52,10
    final topArcPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.035
      ..strokeCap = StrokeCap.round
      ..color = primaryColor.withOpacity(0.45);
    final topArc = Path()
      ..moveTo(w * 0.21, h * 0.26)
      ..cubicTo(w * 0.28, h * 0.16, w * 0.40, h * 0.10, w * 0.52, h * 0.10);
    canvas.drawPath(topArc, topArcPaint);

    // Horizontal bar: 90,50 → 52,50 → 76,50
    final barPath = Path()
      ..moveTo(w * 0.90, h * 0.50)
      ..lineTo(w * 0.52, h * 0.50)
      ..lineTo(w * 0.76, h * 0.50);
    canvas.drawPath(barPath, paint);

    // Dots
    final dotRadius = w * 0.045;
    final dots = [
      (0.21, 0.26),
      (0.52, 0.92),
      (0.90, 0.50),
      (0.52, 0.50),
      (0.76, 0.50),
    ];
    for (final dot in dots) {
      canvas.drawCircle(Offset(w * dot.$1, h * dot.$2), dotRadius, dotPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _NetworkGPainter old) =>
      old.primaryColor != primaryColor || old.accentColor != accentColor;
}
