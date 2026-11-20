from typing import List, Dict, Any

def evaluate_security_rules(apk_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluates modular, evidence-based Android static security rules.
    Every finding includes rule_id, title, severity, category,
    description, evidence, detection_method, reason_for_concern,
    recommended_action, and limitations.
    """
    findings: List[Dict[str, Any]] = []

    package_name = apk_data.get("package_name", "unknown")
    permissions = apk_data.get("permissions", [])
    perm_set = set(permissions)
    target_sdk = apk_data.get("target_sdk", "0")
    debuggable = apk_data.get("debuggable", False)
    allow_backup = apk_data.get("allow_backup", True)
    cleartext_traffic = apk_data.get("cleartext_traffic", False)
    exported_components = apk_data.get("exported_components", [])

    # 1. RULE-SEC-01: Debuggable Application Flag Enabled
    if debuggable:
        findings.append({
            "rule_id": "RULE-SEC-01",
            "title": "Application Is Marked As Debuggable",
            "severity": "CRITICAL",
            "category": "Application Configuration",
            "description": "The Android manifest specifies `android:debuggable=\"true\"`. This allows anyone with ADB access or an on-device debugger to attach to the running process, extract memory, bypass controls, and execute arbitrary code within the application sandbox.",
            "evidence": '<application android:debuggable="true" ...>',
            "detection_method": "Manifest Flag Evaluation",
            "reason_for_concern": "Production applications should never be debuggable as it completely bypasses runtime process isolation and memory integrity.",
            "recommended_action": "Set `android:debuggable=\"false\"` in your production build variants in `build.gradle`.",
            "limitations": "Detected strictly via manifest metadata. Does not evaluate whether root protections or anti-debugging measures exist in native libraries."
        })

    # 2. RULE-SEC-02: Exported Components Without Permission Protection
    unprotected_exported = [c for c in exported_components if c.get("exported")]
    if unprotected_exported:
        sample_names = ", ".join([c["name"].split(".")[-1] for c in unprotected_exported[:3]])
        count = len(unprotected_exported)
        findings.append({
            "rule_id": "RULE-SEC-02",
            "title": f"Unprotected Exported Android Components Detected ({count})",
            "severity": "HIGH" if count >= 3 else "MEDIUM",
            "category": "Component Security",
            "description": f"Found {count} component(s) explicitly or implicitly exported to other applications on the device without custom permission protection (e.g., {sample_names}). Any third-party app installed on the device can invoke these components directly.",
            "evidence": f"{count} exported component(s) found. Examples: {sample_names}",
            "detection_method": "Static Manifest Component Inspection",
            "reason_for_concern": "Exported services, activities, or broadcast receivers can be triggered maliciously by third-party applications, potentially leading to intent spoofing, privilege escalation, or unauthorized action execution.",
            "recommended_action": "Explicitly set `android:exported=\"false\"` on internal components, or enforce `android:permission` on exported components.",
            "limitations": "Static inspection checks for manifest declaration; does not analyze dynamic runtime permission verification implemented inside Java/Kotlin methods."
        })

    # 3. RULE-SEC-03: Cleartext (Plaintext HTTP) Network Traffic Permitted
    if cleartext_traffic:
        findings.append({
            "rule_id": "RULE-SEC-03",
            "title": "Cleartext Network Traffic Allowed (Plaintext HTTP)",
            "severity": "MEDIUM",
            "category": "Network Security",
            "description": "The application allows unencrypted cleartext HTTP communication (`android:usesCleartextTraffic=\"true\"` or targetSdk configuration defaults).",
            "evidence": 'android:usesCleartextTraffic="true" or missing Network Security Config blocking HTTP',
            "detection_method": "Network Configuration Analysis",
            "reason_for_concern": "Unencrypted HTTP traffic can be monitored, intercepted, or modified by adversaries on the local network (such as public Wi-Fi) via Man-in-the-Middle (MitM) attacks.",
            "recommended_action": "Enforce HTTPS communication across all endpoints and configure a strict `network_security_config.xml` with `cleartextTrafficPermitted=\"false\"`.",
            "limitations": "Assesses manifest policy; individual network client configurations in code (e.g. OkHttp certificate pinning) are not dynamically probed."
        })

    # 4. RULE-SEC-04: Application Data Backup Enabled
    if allow_backup:
        findings.append({
            "rule_id": "RULE-SEC-04",
            "title": "Application Data Backup Is Enabled",
            "severity": "LOW",
            "category": "Data Storage",
            "description": "`android:allowBackup=\"true\"` is enabled by default. This permits the Android Debug Bridge (ADB) backup utility to extract private app data to an external machine if USB debugging is enabled on the device.",
            "evidence": '<application android:allowBackup="true" ...>',
            "detection_method": "Manifest Flag Evaluation",
            "reason_for_concern": "Users backing up their phone or connecting to an untrusted workstation could have sensitive cached credentials, tokens, or local databases extracted via ADB backup.",
            "recommended_action": "If your application stores sensitive credentials, tokens, or personal records, set `android:allowBackup=\"false\"` or specify custom rules in `fullBackupContent`.",
            "limitations": "Requires physical access or authorized ADB pairing on the device to exploit."
        })

    # 5. RULE-SEC-05: Critical Permission Combinations
    # Combination A: SMS Interception / Fraud
    has_send_sms = "android.permission.SEND_SMS" in perm_set
    has_receive_sms = "android.permission.RECEIVE_SMS" in perm_set or "android.permission.READ_SMS" in perm_set
    has_internet = "android.permission.INTERNET" in perm_set

    if (has_send_sms or has_receive_sms) and has_internet:
        findings.append({
            "rule_id": "RULE-SEC-05A",
            "title": "High-Risk SMS Exfiltration & Transmission Capability",
            "severity": "HIGH",
            "category": "Permission Combination",
            "description": "The application requests both SMS capabilities (SEND_SMS / RECEIVE_SMS / READ_SMS) and full INTERNET access. This combination is commonly leveraged by banking trojans to intercept one-time passwords (OTPs) and silently transmit them to remote command-and-control servers.",
            "evidence": f"SMS Permissions: {[p for p in ['SEND_SMS', 'RECEIVE_SMS', 'READ_SMS'] if f'android.permission.{p}' in perm_set]} + INTERNET",
            "detection_method": "Correlated Permission Cluster Analysis",
            "reason_for_concern": "Potential interception of 2-factor authentication codes and financial transaction verification without user awareness.",
            "recommended_action": "Verify if direct SMS reading/sending is strictly essential. Use the SMS Retriever API or SMS User Consent API instead of requesting broad SMS permissions.",
            "limitations": "Static combination rule. Legitimate SMS backup or messaging client apps also legitimately require this combination."
        })

    # Combination B: Audio / Location Surveillance
    has_audio = "android.permission.RECORD_AUDIO" in perm_set
    has_loc = "android.permission.ACCESS_FINE_LOCATION" in perm_set or "android.permission.ACCESS_BACKGROUND_LOCATION" in perm_set
    has_cam = "android.permission.CAMERA" in perm_set

    if (has_audio or has_loc or has_cam) and has_internet:
        sensors_requested = []
        if has_audio: sensors_requested.append("Microphone (RECORD_AUDIO)")
        if has_loc: sensors_requested.append("Precise Location")
        if has_cam: sensors_requested.append("Camera")

        if len(sensors_requested) >= 2:
            findings.append({
                "rule_id": "RULE-SEC-05B",
                "title": f"Multi-Sensor Surveillance Capability ({', '.join(sensors_requested)})",
                "severity": "HIGH",
                "category": "Permission Combination",
                "description": f"The application requests multiple sensitive physical sensors ({', '.join(sensors_requested)}) combined with INTERNET access. This creates a theoretical capability for comprehensive physical environment monitoring and remote data exfiltration.",
                "evidence": f"Sensors: {', '.join(sensors_requested)} paired with android.permission.INTERNET",
                "detection_method": "Multi-Sensor Permission Correlation",
                "reason_for_concern": "Allows ongoing acoustic and spatial tracking if background services or background location are invoked.",
                "recommended_action": "Ensure runtime consent is requested only at the moment of feature usage, and provide clear in-app explanations for why each sensor is necessary.",
                "limitations": "Permission presence indicates capability, not necessarily malicious intent or active continuous recording."
            })

    # 6. RULE-SEC-06: Overlay & Dropper Permissions (SYSTEM_ALERT_WINDOW / REQUEST_INSTALL_PACKAGES)
    if "android.permission.SYSTEM_ALERT_WINDOW" in perm_set:
        findings.append({
            "rule_id": "RULE-SEC-06",
            "title": "System Alert Window (Draw Over Other Apps) Requested",
            "severity": "HIGH",
            "category": "High-Risk Capability",
            "description": "The application requests `android.permission.SYSTEM_ALERT_WINDOW`. This permission enables windows to be rendered on top of any active foreground app.",
            "evidence": '<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />',
            "detection_method": "Special Permission Inspection",
            "reason_for_concern": "Historically exploited in Android clickjacking, tapjacking, and overlay attacks to capture passwords by superimposing deceptive input overlays on top of banking applications.",
            "recommended_action": "Avoid using overlay permissions unless building a floating utility tool (e.g. screen recorder or chat head).",
            "limitations": "Modern Android OS restricts overlays during sensitive operations like permission grant dialogues."
        })

    if "android.permission.REQUEST_INSTALL_PACKAGES" in perm_set:
        findings.append({
            "rule_id": "RULE-SEC-07",
            "title": "External Package Installation Capability Requested",
            "severity": "MEDIUM",
            "category": "High-Risk Capability",
            "description": "The application requests `android.permission.REQUEST_INSTALL_PACKAGES`. This allows the application to prompt the user to install secondary external APK files downloaded from unknown sources.",
            "evidence": '<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />',
            "detection_method": "Special Permission Inspection",
            "reason_for_concern": "Frequently found in malware 'droppers' that download secondary malicious payloads after evasion checks pass.",
            "recommended_action": "Ensure all app updates and dependencies are distributed through recognized official app distribution channels.",
            "limitations": "Third-party app stores and browser download managers also require this permission legitimately."
        })

    # 7. RULE-SEC-08: Target SDK Assessment
    try:
        tsdk_int = int(target_sdk)
        if tsdk_int < 31 and tsdk_int > 0:
            findings.append({
                "rule_id": "RULE-SEC-08",
                "title": f"Outdated Target SDK ({target_sdk}) Bypasses Modern Protections",
                "severity": "MEDIUM",
                "category": "Platform Compliance",
                "description": f"The application targets Android API level {target_sdk}, which is older than Android 12 (API 31). Modern Android versions enforce strict component exportation rules, scoped storage restrictions, and background service limits that older target SDKs can bypass.",
                "evidence": f'android:targetSdkVersion="{target_sdk}"',
                "detection_method": "SDK Version Evaluation",
                "reason_for_concern": "Targeting outdated SDKs enables legacy permission behaviors and circumvents modern sandboxing features.",
                "recommended_action": f"Update `targetSdkVersion` to at least API 34 (Android 14) in `build.gradle`.",
                "limitations": "Target SDK evaluation is static; Android runtime compatibility mode applies partial restrictions regardless."
            })
    except Exception:
        pass

    # Informational finding if everything looks standard
    if not findings:
        findings.append({
            "rule_id": "RULE-INFO-01",
            "title": "Baseline Static Checks Passed With Minimal Risk Indicators",
            "severity": "INFORMATIONAL",
            "category": "General Security",
            "description": "No critical misconfigurations, high-risk overlays, or aggressive permission combinations were detected in the application manifest.",
            "evidence": f"Total permissions checked: {len(permissions)}. No anomalous flags discovered.",
            "detection_method": "Baseline Static Rule Engine",
            "reason_for_concern": "N/A — standard baseline.",
            "recommended_action": "Maintain security best practices and ensure all third-party dependencies are kept up-to-date.",
            "limitations": "Static checks do not evaluate dynamic code execution, encrypted native payloads, or server-side vulnerabilities."
        })

    return findings
