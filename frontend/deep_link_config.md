# Deep Link Configuration

After running `flutter create --platforms android,ios .`, add these configurations:

## Android — android/app/src/main/AndroidManifest.xml

Add inside the `<activity>` tag:

```xml
<!-- trustgrid:// URL scheme -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="trustgrid" />
</intent-filter>

<!-- https://trustgrid.ng app links -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="*.trustgrid.ng" />
    <data android:scheme="https" android:host="trustgrid.ng" />
</intent-filter>
```

## iOS — ios/Runner/Info.plist

Add inside the root `<dict>`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLName</key>
        <string>ng.trustgrid.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>trustgrid</string>
        </array>
    </dict>
</array>
<key>FlutterDeepLinkingEnabled</key>
<true/>
```

## Testing deep links

Android:
```bash
adb shell am start -a android.intent.action.VIEW -d "trustgrid://join/redemption-city" ng.trustgrid.app
```

iOS Simulator:
```bash
xcrun simctl openurl booted "trustgrid://join/redemption-city"
```

## URL patterns handled
- `trustgrid://join/redemption-city` → Sets community to redemption-city → Login
- `trustgrid://join/lekki-estate` → Sets community to lekki-estate → Login
- `https://redemption-city.trustgrid.ng/join` → Same as above via app link
- `https://trustgrid.ng/join/redemption-city` → Same as above
