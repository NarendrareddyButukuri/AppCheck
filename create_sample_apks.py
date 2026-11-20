import io
import zipfile
from pathlib import Path

def build_valid_apk(filename: str, package_name: str, app_name: str, permissions: list, debuggable: bool = False, exported_service: bool = False):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        perms_xml = "\n".join([f'    <uses-permission android:name="{p}" />' for p in permissions])
        debug_attr = 'android:debuggable="true"' if debuggable else 'android:debuggable="false"'
        service_xml = f'    <service android:name="{package_name}.RemoteService" android:exported="true" />' if exported_service else ''

        manifest_content = f"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{package_name}"
    android:versionCode="104"
    android:versionName="1.4.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />

{perms_xml}

    <application
        android:label="{app_name}"
        android:allowBackup="true"
        {debug_attr}
        android:supportsRtl="true">

        <activity
            android:name="{package_name}.MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

{service_xml}

    </application>
</manifest>"""
        
        zf.writestr("AndroidManifest.xml", manifest_content.encode("utf-8"))
        zf.writestr("classes.dex", b"dex\n035\x00" + b"\x00" * 200)
        zf.writestr("resources.arsc", b"ARSC" + b"\x00" * 100)
        zf.writestr("META-INF/MANIFEST.MF", b"Manifest-Version: 1.0\r\nCreated-By: Android Gradle 8.2\r\n")

    dest = Path(filename)
    dest.write_bytes(buf.getvalue())
    print(f"Generated sample APK: {dest.name} ({len(buf.getvalue())} bytes)")

if __name__ == "__main__":
    build_valid_apk(
        "sample_safe_calculator.apk",
        "com.clean.tools.calculator",
        "Clean Calculator",
        ["android.permission.INTERNET", "android.permission.VIBRATE"],
        debuggable=False,
        exported_service=False
    )
    build_valid_apk(
        "sample_high_risk_spyware.apk",
        "com.suspicious.analytics.tracker",
        "Super Cleaner &amp; Flashlight",
        [
            "android.permission.INTERNET",
            "android.permission.SEND_SMS",
            "android.permission.RECEIVE_SMS",
            "android.permission.READ_SMS",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.ACCESS_BACKGROUND_LOCATION",
            "android.permission.RECORD_AUDIO",
            "android.permission.READ_CONTACTS",
            "android.permission.READ_PHONE_STATE",
            "android.permission.SYSTEM_ALERT_WINDOW",
            "android.permission.REQUEST_INSTALL_PACKAGES",
            "android.permission.RECEIVE_BOOT_COMPLETED"
        ],
        debuggable=True,
        exported_service=True
    )
