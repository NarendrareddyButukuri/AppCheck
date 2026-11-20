from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.units import inch

def generate_pdf_report(scan_data: Dict[str, Any], output_path: Path) -> Path:
    """
    Generates a genuine, beautifully styled Android Security Intelligence PDF Report
    using ReportLab based on real extracted database scan records.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#0B0E13")
    accent_blue = colors.HexColor("#1A73E8")
    accent_cyan = colors.HexColor("#79B8FF")
    danger_color = colors.HexColor("#D93025")
    warning_color = colors.HexColor("#F9AB00")
    success_color = colors.HexColor("#1E8E3E")
    text_dark = colors.HexColor("#202124")
    text_muted = colors.HexColor("#5F6368")
    table_header_bg = colors.HexColor("#121720")

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=primary_color,
        alignment=0,
        spaceAfter=4,
    )
    
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        textColor=text_muted,
        spaceAfter=14,
    )

    h2_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        textColor=text_dark,
        leading=13,
    )

    bold_body_style = ParagraphStyle(
        "ReportBoldBody",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    code_style = ParagraphStyle(
        "ReportCode",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8,
        textColor=colors.HexColor("#374151"),
        leading=11,
    )

    story = []

    # AppCheck Header Banner
    app_info = scan_data.get("application", {})
    risk = scan_data.get("risk_assessment", {}) or {}
    findings = scan_data.get("findings", [])
    permissions = scan_data.get("permissions", [])

    header_table_data = [
        [
            Paragraph("<b>APPCHECK</b> | Android Security Intelligence Report", title_style),
            Paragraph(f"<b>Engine Version:</b> 1.0.0<br/><b>Generated:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}", body_style)
        ]
    ]
    t_header = Table(header_table_data, colWidths=[4.2 * inch, 3.0 * inch])
    t_header.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t_header)
    story.append(Paragraph("Know what an app can access. Preliminary Heuristic Security Audit.", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_blue, spaceAfter=12))

    # Executive Summary & Risk Gauge Table
    score = risk.get("score", 0)
    risk_level = risk.get("risk_level", "SAFE")
    score_color = danger_color if risk_level == "HIGH" else (warning_color if risk_level == "MEDIUM" else success_color)

    summary_data = [
        [
            Paragraph("<b>APPLICATION METADATA</b>", bold_body_style),
            Paragraph("<b>SECURITY ASSESSMENT SUMMARY</b>", bold_body_style)
        ],
        [
            Paragraph(f"<b>Application:</b> {app_info.get('app_name', 'Unknown')}<br/>"
                      f"<b>Package Name:</b> {app_info.get('package_name', 'Unknown')}<br/>"
                      f"<b>Version:</b> {app_info.get('version_name', '1.0')} (Code {app_info.get('version_code', '1')})<br/>"
                      f"<b>Target SDK:</b> {app_info.get('target_sdk', 'N/A')} | Min SDK: {app_info.get('min_sdk', 'N/A')}<br/>"
                      f"<b>File Size:</b> {round(app_info.get('file_size_bytes', 0) / (1024*1024), 2)} MB<br/>"
                      f"<b>SHA-256:</b> <font size=7>{app_info.get('sha256_hash', 'N/A')[:32]}...</font>", body_style),
            Paragraph(f"<b>Calculated Risk Score:</b> <font color='{score_color.hexval()}'><b>{score} / 100 ({risk_level})</b></font><br/>"
                      f"<b>Summary:</b> {risk.get('summary', 'Standard static analysis completed.')}<br/>"
                      f"<b>Total Permissions:</b> {len(permissions)} (Sensitive: {len([p for p in permissions if p.get('is_dangerous')])})<br/>"
                      f"<b>Security Findings:</b> {len(findings)} detected<br/>"
                      f"<b>ML Evaluation:</b> {risk.get('ml_prediction') or 'Rule-Based Baseline'}", body_style)
        ]
    ]
    t_summary = Table(summary_data, colWidths=[3.6 * inch, 3.6 * inch])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8F9FA")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 14))

    # Security Findings Table
    story.append(Paragraph("Security Findings & Vulnerability Indicators", h2_style))
    if findings:
        findings_table_data = [
            [
                Paragraph("<b>Rule ID</b>", bold_body_style),
                Paragraph("<b>Severity</b>", bold_body_style),
                Paragraph("<b>Title & Evidence</b>", bold_body_style),
                Paragraph("<b>Action Required</b>", bold_body_style),
            ]
        ]
        for f in findings:
            sev = f.get("severity", "LOW")
            badge_color = danger_color if sev in ["CRITICAL", "HIGH"] else (warning_color if sev == "MEDIUM" else text_muted)
            findings_table_data.append([
                Paragraph(f"<b>{f.get('rule_id')}</b>", code_style),
                Paragraph(f"<font color='{badge_color.hexval()}'><b>{sev}</b></font>", bold_body_style),
                Paragraph(f"<b>{f.get('title')}</b><br/><font color='#555'>{f.get('description')}</font><br/><b>Evidence:</b> <font color='#2563EB'>{f.get('evidence') or 'Manifest declaration'}</font>", body_style),
                Paragraph(f"{f.get('recommended_action') or 'Review configuration.'}", body_style)
            ])
        t_findings = Table(findings_table_data, colWidths=[1.1 * inch, 0.9 * inch, 3.4 * inch, 1.8 * inch])
        t_findings.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#EBF3FA")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_findings)
    else:
        story.append(Paragraph("No critical or elevated risk findings detected.", body_style))

    story.append(Spacer(1, 14))

    # Extracted Permissions Sample
    story.append(Paragraph("Requested Permissions Intelligence", h2_style))
    if permissions:
        perm_table_data = [
            [
                Paragraph("<b>Permission Name</b>", bold_body_style),
                Paragraph("<b>Category</b>", bold_body_style),
                Paragraph("<b>Protection</b>", bold_body_style),
                Paragraph("<b>Security Relevance</b>", bold_body_style),
            ]
        ]
        # Show top 15 permissions
        for p in permissions[:15]:
            is_dang = p.get("is_dangerous", False)
            color_str = danger_color.hexval() if is_dang else text_dark.hexval()
            perm_table_data.append([
                Paragraph(f"<font color='{color_str}'>{p.get('permission_name').split('.')[-1]}</font>", code_style),
                Paragraph(p.get("category", "Other"), body_style),
                Paragraph(f"<b>{p.get('protection_level', 'Unknown')}</b>", body_style),
                Paragraph(p.get("security_relevance", "Standard capability.")[:140], body_style),
            ])
        t_perms = Table(perm_table_data, colWidths=[2.2 * inch, 1.3 * inch, 1.1 * inch, 2.6 * inch])
        t_perms.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t_perms)
        if len(permissions) > 15:
            story.append(Paragraph(f"<i>...and {len(permissions) - 15} additional permissions documented in digital audit log.</i>", subtitle_style))

    story.append(Spacer(1, 14))

    # Methodology & Disclaimer
    story.append(Paragraph("Methodology & Disclaimers", h2_style))
    disclaimer_text = (
        "<b>Analysis Methodology:</b> Static analysis performs signature inspection of AndroidManifest.xml, components, "
        "and security flags without executing the bytecode in an emulator. "
        "<b>Important Disclaimer:</b> AppCheck provides first-level static security analysis. It cannot guarantee that an application "
        "is completely safe or conclusively determine malicious behavior. Dynamic evasions, encrypted payload delivery, "
        "and runtime command-and-control operations are outside the scope of static manifest analysis."
    )
    story.append(Paragraph(disclaimer_text, body_style))

    # Build PDF
    doc.build(story)
    return output_path
