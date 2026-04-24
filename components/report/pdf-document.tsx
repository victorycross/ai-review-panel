import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { RiskReport, PersonaAssessment } from "@/lib/types";
import { RISK_LEVEL_COLORS, DIMENSION_COLORS } from "@/lib/constants";

// Disable react-pdf's aggressive mid-word hyphenation so table cells
// wrap on word boundaries instead of producing "Evalu-ation", "fair-ness", etc.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  coverPage: {
    backgroundColor: "#0a0a0a",
    padding: 48,
    fontFamily: "Helvetica",
    color: "#e5e5e5",
  },
  brand: { fontSize: 8, color: "#71717a", letterSpacing: 2, marginBottom: 60 },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#f5f5f5",
    marginBottom: 8,
  },
  coverSubtitle: { fontSize: 12, color: "#a3a3a3", marginBottom: 4 },
  coverDate: { fontSize: 10, color: "#71717a", marginBottom: 32 },
  riskPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  riskPillText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: "#ffffff",
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#0d9488",
    marginBottom: 10,
    marginTop: 24,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  body: { fontSize: 10, color: "#374151", lineHeight: 1.6, marginBottom: 8 },
  narrativePara: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 6,
  },
  narrativeHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 10,
    marginBottom: 4,
  },
  narrativeSubHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginTop: 6,
    marginBottom: 3,
  },
  bulletRow: { flexDirection: "row", marginBottom: 4 },
  bulletDot: { fontSize: 10, color: "#0d9488", marginRight: 6 },
  bulletText: { fontSize: 10, color: "#374151", lineHeight: 1.5, flex: 1 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: "1 solid #e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: "1 solid #f3f4f6",
  },
  tableCell: { fontSize: 9, color: "#374151" },
  tableCellBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },
  tableCellHeader: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  divider: { borderBottom: "1 solid #e5e7eb", marginVertical: 12 },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: "#9ca3af" },
  findingBox: {
    borderLeft: "3 solid #0d9488",
    paddingLeft: 8,
    marginBottom: 12,
  },
  findingTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  findingMeta: { fontSize: 8, color: "#6b7280", marginBottom: 3 },
  findingBody: { fontSize: 9, color: "#374151", lineHeight: 1.5, marginBottom: 3 },
  findingRef: { fontSize: 8, color: "#6b7280", fontFamily: "Helvetica-Oblique" },
  emptyNote: {
    fontSize: 9,
    color: "#9ca3af",
    fontFamily: "Helvetica-Oblique",
    marginTop: 12,
  },
});

function RiskBadge({ level }: { level: string }) {
  const color = RISK_LEVEL_COLORS[level] ?? "#64748b";
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{level}</Text>
    </View>
  );
}

// Minimal markdown-ish renderer for narrative text.
// Supports #/##/### headings and blank-line paragraph breaks.
// Treats everything else as a paragraph (bold/italic markers are left inline).
function renderNarrative(source: string, keyPrefix: string) {
  const blocks = source
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return blocks.map((block, i) => {
    const key = `${keyPrefix}-${i}`;
    const h1 = block.match(/^#\s+(.*)$/);
    const h2 = block.match(/^##\s+(.*)$/);
    const h3 = block.match(/^###\s+(.*)$/);
    if (h1) {
      return (
        <Text key={key} style={styles.narrativeHeading}>
          {h1[1]}
        </Text>
      );
    }
    if (h2) {
      return (
        <Text key={key} style={styles.narrativeHeading}>
          {h2[1]}
        </Text>
      );
    }
    if (h3) {
      return (
        <Text key={key} style={styles.narrativeSubHeading}>
          {h3[1]}
        </Text>
      );
    }
    // Strip inline markdown markers that render poorly in plain Text
    const cleaned = block.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");
    return (
      <Text key={key} style={styles.narrativePara}>
        {cleaned}
      </Text>
    );
  });
}

interface Props {
  report: RiskReport;
}

export function ReportPdfDocument({ report }: Props) {
  const date = new Date(report.assessmentDate).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const crossIssues = report.crossDimensionalIssues ?? [];
  const hasCrossPage = crossIssues.length > 0 || !!report.examinationText;

  return (
    <Document
      title={`${report.systemName} — AI Risk Assessment`}
      author="techassist · BrightPath Technologies"
    >
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.brand}>TECHASSIST · BRIGHTPATH TECHNOLOGIES</Text>
        <Text style={styles.coverTitle}>{report.systemName}</Text>
        <Text style={styles.coverSubtitle}>{report.vendor} · AI Risk Assessment Report</Text>
        <Text style={styles.coverDate}>{date}</Text>
        <View style={[styles.riskPill, { backgroundColor: RISK_LEVEL_COLORS[report.overallRisk] }]}>
          <Text style={styles.riskPillText}>Overall Risk: {report.overallRisk}</Text>
        </View>
        <View style={[styles.footer, { bottom: 32 }]}>
          <Text style={[styles.footerText, { color: "#4b5563" }]}>
            Confidential — For internal use only
          </Text>
          <Text style={[styles.footerText, { color: "#4b5563" }]}>
            Generated by techassist
          </Text>
        </View>
      </Page>

      {/* Executive Summary + Risk Summary */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        {report.executiveSummary.split("\n\n").map((para, i) => (
          <Text key={i} style={styles.body}>{para}</Text>
        ))}

        <Text style={styles.sectionTitle}>Risk Summary</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, { flex: 3 }]}>Dimension</Text>
          <Text style={[styles.tableCellHeader, { flex: 1 }]}>Risk Level</Text>
          <Text style={[styles.tableCellHeader, { flex: 1 }]}>Findings</Text>
        </View>
        {report.assessments.map((a) => (
          <View key={a.personaId} style={styles.tableRow}>
            <View style={{ flex: 3, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: DIMENSION_COLORS[a.dimension] ?? "#64748b",
                }}
              />
              <Text style={styles.tableCell}>{a.dimension}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <RiskBadge level={a.overallDimensionRisk} />
            </View>
            <Text style={[styles.tableCell, { flex: 1 }]}>{a.findings.length}</Text>
          </View>
        ))}
        <View style={[styles.tableRow, { backgroundColor: "#f9fafb" }]}>
          <Text style={[styles.tableCellBold, { flex: 3 }]}>Overall</Text>
          <View style={{ flex: 1 }}>
            <RiskBadge level={report.overallRisk} />
          </View>
          <Text style={[styles.tableCell, { flex: 1 }]}>{report.allFindings.length}</Text>
        </View>

        <View style={[styles.footer]}>
          <Text style={styles.footerText}>techassist · BrightPath Technologies</Text>
          <Text style={styles.footerText}>Confidential</Text>
        </View>
      </Page>

      {/* Cross-Dimensional Analysis */}
      {hasCrossPage && (
        <Page size="A4" style={styles.page}>
          {crossIssues.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Cross-Dimensional Issues</Text>
              {crossIssues.map((issue, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{issue}</Text>
                </View>
              ))}
            </>
          )}
          {report.examinationText && (
            <>
              <Text style={styles.sectionTitle}>Cross-Dimensional Examination</Text>
              {renderNarrative(report.examinationText, "exam")}
            </>
          )}
          <View style={styles.footer}>
            <Text style={styles.footerText}>techassist · BrightPath Technologies</Text>
            <Text style={styles.footerText}>Confidential</Text>
          </View>
        </Page>
      )}

      {/* Findings by Dimension — one page per persona, with narrative + findings */}
      {report.assessments.map((assessment: PersonaAssessment) => (
        <Page key={assessment.personaId} size="A4" style={styles.page}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: DIMENSION_COLORS[assessment.dimension] ?? "#64748b",
              }}
            />
            <Text style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>
              {assessment.dimension}
            </Text>
            <RiskBadge level={assessment.overallDimensionRisk} />
          </View>
          <Text style={[styles.tableCellHeader, { marginBottom: 8 }]}>
            {assessment.personaName}
          </Text>

          {assessment.narrative && (
            <View style={{ marginBottom: 12 }}>
              {renderNarrative(assessment.narrative, `narr-${assessment.personaId}`)}
            </View>
          )}

          {assessment.findings.length > 0 ? (
            assessment.findings.map((finding, i) => (
              <View key={finding.id} style={styles.findingBox}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Text style={styles.findingTitle}>{i + 1}. {finding.title}</Text>
                  <RiskBadge level={finding.riskLevel} />
                </View>
                <Text style={styles.findingBody}>{finding.description}</Text>
                <Text style={styles.findingRef}>
                  {finding.guidelineReference} · Owner: {finding.suggestedOwner}
                </Text>
                <Text style={[styles.findingMeta, { color: "#0d9488" }]}>
                  → {finding.recommendation}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyNote}>
              No structured findings recorded for this dimension. Narrative assessment above.
            </Text>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>techassist · {report.systemName}</Text>
            <Text style={styles.footerText}>Confidential</Text>
          </View>
        </Page>
      ))}

      {/* Prioritised Recommendations */}
      {report.prioritizedRecommendations.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Prioritised Recommendations</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, { width: 20 }]}>#</Text>
            <Text style={[styles.tableCellHeader, { flex: 3 }]}>Finding</Text>
            <Text style={[styles.tableCellHeader, { flex: 3.5 }]}>Action</Text>
            <Text style={[styles.tableCellHeader, { flex: 3 }]}>Owner</Text>
            <Text style={[styles.tableCellHeader, { flex: 1 }]}>Timeline</Text>
          </View>
          {report.prioritizedRecommendations.map((rec) => (
            <View key={rec.priority} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: 20 }]}>{rec.priority}</Text>
              <View style={{ flex: 3 }}>
                <Text style={styles.tableCellBold}>{rec.findingTitle}</Text>
                <Text style={[styles.tableCell, { color: "#6b7280" }]}>{rec.dimension}</Text>
              </View>
              <Text style={[styles.tableCell, { flex: 3.5 }]}>{rec.action}</Text>
              <Text style={[styles.tableCell, { flex: 3 }]}>{rec.suggestedOwner}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{rec.timeline}</Text>
            </View>
          ))}
          <View style={styles.footer}>
            <Text style={styles.footerText}>techassist · BrightPath Technologies</Text>
            <Text style={styles.footerText}>Confidential</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}
