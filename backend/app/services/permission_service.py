from typing import Dict, Any, Tuple

# Comprehensive Android Permission Knowledge Base
KNOWN_PERMISSIONS: Dict[str, Dict[str, Any]] = {
    # Location
    "android.permission.ACCESS_FINE_LOCATION": {
        "category": "Location",
        "protection_level": "Dangerous",
        "description": "Allows the app to access precise location from location sources such as GPS, cell towers, and Wi-Fi.",
        "is_dangerous": True,
        "security_relevance": "High risk of physical tracking and user surveillance. Apps can track the exact physical whereabouts of the user in real time.",
    },
    "android.permission.ACCESS_COARSE_LOCATION": {
        "category": "Location",
        "protection_level": "Dangerous",
        "description": "Allows the app to access approximate location derived from network location sources like cell towers and Wi-Fi.",
        "is_dangerous": True,
        "security_relevance": "Allows general area tracking without GPS precision, still revealing neighborhood/city level presence.",
    },
    "android.permission.ACCESS_BACKGROUND_LOCATION": {
        "category": "Location",
        "protection_level": "Dangerous",
        "description": "Allows the app to access location in the background when the user is not actively interacting with the app.",
        "is_dangerous": True,
        "security_relevance": "Critical privacy concern. Enables continuous passive location logging without user awareness.",
    },

    # Camera & Microphone
    "android.permission.CAMERA": {
        "category": "Camera",
        "protection_level": "Dangerous",
        "description": "Required to be able to access the camera device to take photos and record video.",
        "is_dangerous": True,
        "security_relevance": "High risk of covert visual surveillance or unauthorized photo capture if abused.",
    },
    "android.permission.RECORD_AUDIO": {
        "category": "Microphone",
        "protection_level": "Dangerous",
        "description": "Allows an application to record audio using the device microphone.",
        "is_dangerous": True,
        "security_relevance": "Critical risk of audio eavesdropping, background recording, and voice capture.",
    },

    # Contacts
    "android.permission.READ_CONTACTS": {
        "category": "Contacts",
        "protection_level": "Dangerous",
        "description": "Allows an application to read the user's contacts data, including phone numbers and emails.",
        "is_dangerous": True,
        "security_relevance": "Severe data exfiltration risk. Enables harvesting of social circles and private contact details.",
    },
    "android.permission.WRITE_CONTACTS": {
        "category": "Contacts",
        "protection_level": "Dangerous",
        "description": "Allows an application to modify or delete the user's contacts data.",
        "is_dangerous": True,
        "security_relevance": "Potential for unauthorized modification, corruption, or injection of spoofed contact entries.",
    },
    "android.permission.GET_ACCOUNTS": {
        "category": "Contacts",
        "protection_level": "Dangerous",
        "description": "Allows access to the list of accounts in the Accounts Service (e.g. Google accounts).",
        "is_dangerous": True,
        "security_relevance": "Identity discovery. Exposes registered accounts associated with the device.",
    },

    # Phone & Calling
    "android.permission.READ_PHONE_STATE": {
        "category": "Phone",
        "protection_level": "Dangerous",
        "description": "Allows read-only access to phone state, including phone number, cellular network information, and ongoing calls.",
        "is_dangerous": True,
        "security_relevance": "Frequently abused for persistent hardware device fingerprinting (IMEI, carrier, SIM serial).",
    },
    "android.permission.CALL_PHONE": {
        "category": "Phone",
        "protection_level": "Dangerous",
        "description": "Allows an application to initiate a phone call without going through the Dialer user interface.",
        "is_dangerous": True,
        "security_relevance": "Financial risk. Rogue applications could dial premium-rate numbers without confirmation.",
    },
    "android.permission.READ_CALL_LOG": {
        "category": "Phone",
        "protection_level": "Dangerous",
        "description": "Allows an application to read the user's call log history.",
        "is_dangerous": True,
        "security_relevance": "Severe privacy violation. Reveals communication partners, call frequency, and timestamps.",
    },
    "android.permission.WRITE_CALL_LOG": {
        "category": "Phone",
        "protection_level": "Dangerous",
        "description": "Allows an application to write and modify the user's call log.",
        "is_dangerous": True,
        "security_relevance": "Could be used by malware to cover its tracks after making toll calls.",
    },

    # SMS
    "android.permission.SEND_SMS": {
        "category": "SMS",
        "protection_level": "Dangerous",
        "description": "Allows an application to send SMS messages silently in the background.",
        "is_dangerous": True,
        "security_relevance": "Classic toll fraud vector. Can send premium SMS messages costing real money.",
    },
    "android.permission.RECEIVE_SMS": {
        "category": "SMS",
        "protection_level": "Dangerous",
        "description": "Allows an application to receive and intercept incoming SMS messages.",
        "is_dangerous": True,
        "security_relevance": "Critical 2FA interception risk. Malware commonly uses this to steal banking OTP codes.",
    },
    "android.permission.READ_SMS": {
        "category": "SMS",
        "protection_level": "Dangerous",
        "description": "Allows an application to read SMS messages stored on the device.",
        "is_dangerous": True,
        "security_relevance": "Massive credential & OTP theft risk. Exposes two-factor authentication codes and private conversations.",
    },

    # Storage & Media
    "android.permission.READ_EXTERNAL_STORAGE": {
        "category": "Storage and media",
        "protection_level": "Dangerous",
        "description": "Allows an application to read from external storage (SD card / shared storage).",
        "is_dangerous": True,
        "security_relevance": "Exposes photos, downloaded documents, and files belonging to other applications.",
    },
    "android.permission.WRITE_EXTERNAL_STORAGE": {
        "category": "Storage and media",
        "protection_level": "Dangerous",
        "description": "Allows an application to write to external storage.",
        "is_dangerous": True,
        "security_relevance": "Allows tampering with shared files or downloading malicious payload files to disk.",
    },
    "android.permission.READ_MEDIA_IMAGES": {
        "category": "Storage and media",
        "protection_level": "Dangerous",
        "description": "Allows an application to read image files from external storage (Android 13+).",
        "is_dangerous": True,
        "security_relevance": "Direct access to user photo gallery and private images.",
    },
    "android.permission.READ_MEDIA_VIDEO": {
        "category": "Storage and media",
        "protection_level": "Dangerous",
        "description": "Allows an application to read video files from external storage (Android 13+).",
        "is_dangerous": True,
        "security_relevance": "Access to recorded personal videos and stored media.",
    },
    "android.permission.READ_MEDIA_AUDIO": {
        "category": "Storage and media",
        "protection_level": "Dangerous",
        "description": "Allows an application to read audio files from external storage (Android 13+).",
        "is_dangerous": True,
        "security_relevance": "Access to music files and saved voice recordings.",
    },

    # Network
    "android.permission.INTERNET": {
        "category": "Network",
        "protection_level": "Normal",
        "description": "Allows applications to open network sockets to communicate over the Internet.",
        "is_dangerous": False,
        "security_relevance": "Normal for web-enabled apps, but critical when paired with sensitive data harvesting permissions.",
    },
    "android.permission.ACCESS_NETWORK_STATE": {
        "category": "Network",
        "protection_level": "Normal",
        "description": "Allows applications to access information about networks (Wi-Fi, cellular, roaming status).",
        "is_dangerous": False,
        "security_relevance": "Allows tracking network connectivity changes.",
    },
    "android.permission.ACCESS_WIFI_STATE": {
        "category": "Network",
        "protection_level": "Normal",
        "description": "Allows applications to access information about Wi-Fi networks.",
        "is_dangerous": False,
        "security_relevance": "Can be used for coarse indoor positioning by inspecting nearby BSSIDs.",
    },

    # Calendar
    "android.permission.READ_CALENDAR": {
        "category": "Calendar",
        "protection_level": "Dangerous",
        "description": "Allows an application to read the user's calendar data and events.",
        "is_dangerous": True,
        "security_relevance": "Exposes meeting schedules, confidential agendas, participants, and locations.",
    },
    "android.permission.WRITE_CALENDAR": {
        "category": "Calendar",
        "protection_level": "Dangerous",
        "description": "Allows an application to create, edit, or delete calendar events.",
        "is_dangerous": True,
        "security_relevance": "Allows calendar spam or unauthorized tampering with user appointments.",
    },

    # Sensors & Body
    "android.permission.BODY_SENSORS": {
        "category": "Sensors",
        "protection_level": "Dangerous",
        "description": "Allows an application to access data from sensors that the user uses to measure what is happening inside their body (heart rate, step counts).",
        "is_dangerous": True,
        "security_relevance": "Biometric and health data leakage.",
    },
    "android.permission.ACTIVITY_RECOGNITION": {
        "category": "Sensors",
        "protection_level": "Dangerous",
        "description": "Allows an application to recognize physical activity (walking, biking, in vehicle).",
        "is_dangerous": True,
        "security_relevance": "Behavioral pattern tracking.",
    },

    # Special / System permissions
    "android.permission.SYSTEM_ALERT_WINDOW": {
        "category": "Other permissions",
        "protection_level": "Special",
        "description": "Allows an app to create windows shown on top of all other apps (draw over other apps).",
        "is_dangerous": True,
        "security_relevance": "Major overlay attack / clickjacking vector. Malicious apps use this to draw fake login dialogs over banking apps.",
    },
    "android.permission.REQUEST_INSTALL_PACKAGES": {
        "category": "Other permissions",
        "protection_level": "Special",
        "description": "Allows an application to request installing packages on the device.",
        "is_dangerous": True,
        "security_relevance": "Dropper vector. Allows downloading and prompting installation of external secondary APKs.",
    },
    "android.permission.RECEIVE_BOOT_COMPLETED": {
        "category": "Other permissions",
        "protection_level": "Normal",
        "description": "Allows an application to receive the Intent that is broadcast after the system finishes booting.",
        "is_dangerous": False,
        "security_relevance": "Enables persistence. Allows background services to automatically start on every device reboot.",
    },
    "android.permission.WAKE_LOCK": {
        "category": "Other permissions",
        "protection_level": "Normal",
        "description": "Allows using PowerManager WakeLocks to keep processor from sleeping or screen from dimming.",
        "is_dangerous": False,
        "security_relevance": "Battery drain concern if abused.",
    },
    "android.permission.VIBRATE": {
        "category": "Other permissions",
        "protection_level": "Normal",
        "description": "Allows access to the vibrator.",
        "is_dangerous": False,
        "security_relevance": "Haptic feedback, minimal security impact.",
    },
}

def analyze_permission(perm_name: str) -> Dict[str, Any]:
    """Classifies a permission string and provides human-readable context."""
    perm_clean = perm_name.strip()
    
    if perm_clean in KNOWN_PERMISSIONS:
        info = KNOWN_PERMISSIONS[perm_clean]
        return {
            "permission_name": perm_clean,
            "category": info["category"],
            "protection_level": info["protection_level"],
            "description": info["description"],
            "is_dangerous": info["is_dangerous"],
            "is_recognized": True,
            "security_relevance": info["security_relevance"],
            "evidence": f'<uses-permission android:name="{perm_clean}" />',
        }
    
    # Heuristic categorization for custom or unknown permissions
    perm_lower = perm_clean.lower()
    is_custom = not perm_clean.startswith("android.permission.") and not perm_clean.startswith("com.android.")
    
    category = "Other permissions"
    if "location" in perm_lower or "gps" in perm_lower:
        category = "Location"
    elif "camera" in perm_lower:
        category = "Camera"
    elif "audio" in perm_lower or "record" in perm_lower or "mic" in perm_lower:
        category = "Microphone"
    elif "contact" in perm_lower:
        category = "Contacts"
    elif "sms" in perm_lower or "mms" in perm_lower:
        category = "SMS"
    elif "phone" in perm_lower or "call" in perm_lower:
        category = "Phone"
    elif "storage" in perm_lower or "media" in perm_lower or "sdcard" in perm_lower:
        category = "Storage and media"
    elif "network" in perm_lower or "wifi" in perm_lower or "internet" in perm_lower:
        category = "Network"
    elif "calendar" in perm_lower:
        category = "Calendar"
    elif "sensor" in perm_lower or "step" in perm_lower or "heart" in perm_lower:
        category = "Sensors"

    protection_level = "Custom" if is_custom else "Unknown"
    short_name = perm_clean.split(".")[-1]
    
    return {
        "permission_name": perm_clean,
        "category": category,
        "protection_level": protection_level,
        "description": f"Custom or vendor-defined permission ({short_name}). Defined by application or OEM.",
        "is_dangerous": False,
        "is_recognized": False,
        "security_relevance": "Non-standard permission. Assess if this grants special OEM or application-specific capabilities.",
        "evidence": f'<uses-permission android:name="{perm_clean}" />',
    }
