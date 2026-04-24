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
// wrap on word boundaries instead of producing "Evalu-ation", "fair-ness".
Font.registerHyphenationCallback((word) => [word]);

// Design tokens — audit-grade palette. Slate neutrals, single deep-teal
// accent. Risk-level + dimension colors remain semantic and live in constants.
const color = {
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  subtle: "#94a3b8",
  rule: "#e2e8f0",
  ruleSoft: "#f1f5f9",
  canvasAlt: "#f8fafc",
  accent: "#164e63",
  cover: "#0f172a",
  coverInk: "#f8fafc",
  coverMuted: "#94a3b8",
};

const styles = StyleSheet.create({
  // Body page — leaves room for fixed running header and footer.
  page: {
    backgroundColor: "#ffffff",
    paddingTop: 64,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: color.body,
    lineHeight: 1.55,
  },
  coverPage: {
    backgroundColor: color.cover,
    padding: 56,
    fontFamily: "Helvetica",
    color: color.coverInk,
  },
  // Running header / footer frames (rendered with `fixed`).
  runningHeader: {
    position: "absolute",
    top: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: `0.5 solid ${color.rule}`,
    paddingBottom: 6,
  },
  runningHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: color.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  runningHeaderDim: {
    fontSize: 8,
    color: color.muted,
  },
  runningFooter: {
    position: "absolute",
    bottom: 28,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `0.5 solid ${color.rule}`,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: color.subtle,
  },
  // Cover
  brand: {
    fontSize: 8,
    color: color.coverMuted,
    letterSpacing: 2,
    marginBottom: 44,
  },
  coverDivider: {
    width: 40,
    height: 2,
    backgroundColor: color.coverInk,
    marginBottom: 16,
  },
  coverEyebrow: {
    fontSize: 9,
    color: color.coverMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: color.coverInk,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 12,
    color: color.coverMuted,
    marginBottom: 3,
  },
  coverDate: {
    fontSize: 10,
    color: color.coverMuted,
    marginBottom: 40,
  },
  overallRiskCard: {
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
    borderLeftColor: color.coverInk,
    backgroundColor: "rgba(255,255,255,0.04)",
    width: 320,
  },
  overallRiskLabel: {
    fontSize: 8,
    color: color.coverMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  overallRiskValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: color.coverInk,
  },
  coverStripTitle: {
    fontSize: 8,
    color: color.coverMuted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 8,
  },
  coverStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  coverStripCell: {
    width: 150,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderLeftWidth: 2,
    borderLeftStyle: "solid",
  },
  coverStripDim: {
    fontSize: 8,
    color: color.coverMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  coverStripRisk: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: color.coverInk,
  },
  coverFooter: {
    position: "absolute",
    bottom: 40,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coverFooterText: {
    fontSize: 8,
    color: color.coverMuted,
  },
  // Typography
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: color.accent,
    marginBottom: 12,
    marginTop: 20,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: color.ink,
    marginBottom: 4,
  },
  pageEyebrow: {
    fontSize: 8,
    color: color.muted,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pageRule: {
    height: 2,
    width: 32,
    backgroundColor: color.accent,
    marginTop: 8,
    marginBottom: 20,
  },
  lead: {
    fontSize: 11,
    color: color.ink,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  body: {
    fontSize: 10,
    color: color.body,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  narrativePara: {
    fontSize: 10,
    color: color.body,
    lineHeight: 1.6,
    marginBottom: 6,
  },
  narrativeHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: color.ink,
    marginTop: 10,
    marginBottom: 4,
  },
  narrativeSubHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: color.body,
    marginTop: 6,
    marginBottom: 3,
  },
  // Tables
  tableHeader: {
    flexDirection: "row",
    backgroundColor: color.canvasAlt,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `1 solid ${color.rule}`,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: `0.5 solid ${color.ruleSoft}`,
    alignItems: "flex-start",
  },
  tableRowAlt: {
    backgroundColor: color.canvasAlt,
  },
  tableRowTotal: {
    backgroundColor: "#e2e8f0",
  },
  tableCell: { fontSize: 9, color: color.body },
  tableCellBold: { fontSize: 9, fontFamily: "Helvetica-Bold", color: color.ink },
  tableCellHeader: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: color.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  // Risk badge
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  // Bullets
  bulletRow: { flexDirection: "row", marginBottom: 6 },
  bulletDot: {
    fontSize: 10,
    color: color.accent,
    marginRight: 6,
    width: 10,
  },
  bulletText: { fontSize: 10, color: color.body, lineHeight: 1.55, flex: 1 },
  // Heat map
  heatMap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  heatCell: {
    width: "48%",
    marginRight: "2%",
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: color.canvasAlt,
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
  },
  heatCellDim: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: color.ink,
    marginBottom: 6,
  },
  heatCellMeta: {
    fontSize: 8,
    color: color.muted,
  },
  // Findings
  findingBox: {
    borderLeftWidth: 3,
    borderLeftStyle: "solid",
    borderLeftColor: color.accent,
    paddingLeft: 10,
    marginBottom: 14,
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  findingTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: color.ink,
    flex: 1,
    marginRight: 8,
  },
  findingMeta: { fontSize: 8, color: color.muted, marginBottom: 3 },
  findingBody: {
    fontSize: 9,
    color: color.body,
    lineHeight: 1.55,
    marginBottom: 4,
  },
  findingRef: {
    fontSize: 8,
    color: color.muted,
    fontFamily: "Helvetica-Oblique",
    marginBottom: 4,
  },
  findingRecLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: color.accent,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  findingRec: {
    fontSize: 9,
    color: color.body,
    lineHeight: 1.55,
  },
  emptyNote: {
    fontSize: 9,
    color: color.subtle,
    fontFamily: "Helvetica-Oblique",
    marginTop: 12,
  },
  // TOC
  tocItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: `0.3 solid ${color.ruleSoft}`,
  },
  tocNum: { fontSize: 10, color: color.muted, width: 24, paddingTop: 1 },
  tocCol: { flex: 1, flexDirection: "column" },
  tocLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: color.ink,
    marginBottom: 3,
  },
  tocNote: { fontSize: 9, color: color.muted, lineHeight: 1.4 },
  // Persona page header strip
  personaStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  personaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  personaDim: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: color.accent,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});

function RiskBadge({ level }: { level: string }) {
  const bg = RISK_LEVEL_COLORS[level] ?? "#64748b";
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeText}>{level}</Text>
    </View>
  );
}

function PageFrame({
  systemName,
  sectionName,
}: {
  systemName: string;
  sectionName: string;
}) {
  return (
    <>
      <View style={styles.runningHeader} fixed>
        <Text style={styles.runningHeaderText}>
          techassist · {systemName}
        </Text>
        <Text style={styles.runningHeaderDim}>{sectionName}</Text>
      </View>
      <View style={styles.runningFooter} fixed>
        <Text style={styles.footerText}>
          BrightPath Technologies · Confidential — For internal use only
        </Text>
        <Text
          style={styles.footerText}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </>
  );
}

// Minimal markdown-ish renderer for narrative text.
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
    if (h1)
      return (
        <Text key={key} style={styles.narrativeHeading}>
          {h1[1]}
        </Text>
      );
    if (h2)
      return (
        <Text key={key} style={styles.narrativeHeading}>
          {h2[1]}
        </Text>
      );
    if (h3)
      return (
        <Text key={key} style={styles.narrativeSubHeading}>
          {h3[1]}
        </Text>
      );
    const cleaned = block
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/`(.+?)`/g, "$1");
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
  const dimensionRisks = report.dimensionRisks ?? {};

  const tocSections: Array<{ num: string; label: string; note?: string }> = [
    { num: "1", label: "Executive Summary", note: "Top-line conclusion and immediate actions" },
    { num: "2", label: "Risk Summary & Heat Map", note: "Ratings and finding counts per dimension" },
  ];
  let sectionIdx = 3;
  if (hasCrossPage) {
    tocSections.push({
      num: String(sectionIdx++),
      label: "Cross-Dimensional Analysis",
      note: "Compounding risks and systemic patterns",
    });
  }
  tocSections.push({
    num: String(sectionIdx++),
    label: "Findings by Dimension",
    note: "Six specialist assessments",
  });
  if (report.prioritizedRecommendations.length > 0) {
    tocSections.push({
      num: String(sectionIdx++),
      label: "Prioritised Recommendations",
      note: `${report.prioritizedRecommendations.length} actions with owners and timelines`,
    });
  }

  return (
    <Document
      title={`${report.systemName} — AI Risk Assessment`}
      author="techassist · BrightPath Technologies"
    >
      {/* Cover Page */}
      <Page size="A4" style={styles.coverPage}>
        <Text style={styles.brand}>TECHASSIST · BRIGHTPATH TECHNOLOGIES</Text>
        <View style={styles.coverDivider} />
        <Text style={styles.coverEyebrow}>AI System Review Panel</Text>
        <Text style={styles.coverTitle}>{report.systemName}</Text>
        <Text style={styles.coverSubtitle}>{report.vendor}</Text>
        <Text style={styles.coverDate}>{date}</Text>

        <View
          style={[
            styles.overallRiskCard,
            { borderLeftColor: RISK_LEVEL_COLORS[report.overallRisk] ?? color.coverInk },
          ]}
        >
          <Text style={styles.overallRiskLabel}>Overall Risk Posture</Text>
          <Text style={styles.overallRiskValue}>{report.overallRisk}</Text>
        </View>

        <Text style={styles.coverStripTitle}>Dimension Ratings</Text>
        <View style={styles.coverStrip}>
          {report.assessments.map((a) => (
            <View
              key={a.personaId}
              style={[
                styles.coverStripCell,
                { borderLeftColor: RISK_LEVEL_COLORS[a.overallDimensionRisk] ?? color.coverMuted },
              ]}
            >
              <Text style={styles.coverStripDim}>{a.dimension}</Text>
              <Text style={styles.coverStripRisk}>{a.overallDimensionRisk}</Text>
            </View>
          ))}
        </View>

        <View style={styles.coverFooter} fixed>
          <Text style={styles.coverFooterText}>
            Confidential — For internal use only
          </Text>
          <Text style={styles.coverFooterText}>Generated by techassist</Text>
        </View>
      </Page>

      {/* Report Contents */}
      <Page size="A4" style={styles.page} bookmark="Contents">
        <PageFrame systemName={report.systemName} sectionName="Contents" />
        <Text style={styles.pageEyebrow}>Report</Text>
        <Text style={styles.pageTitle}>Contents</Text>
        <View style={styles.pageRule} />
        {tocSections.map((s) => (
          <View key={s.num} style={styles.tocItem} wrap={false}>
            <Text style={styles.tocNum}>{s.num}.</Text>
            <View style={styles.tocCol}>
              <Text style={styles.tocLabel}>{s.label}</Text>
              {s.note && <Text style={styles.tocNote}>{s.note}</Text>}
            </View>
          </View>
        ))}
      </Page>

      {/* Executive Summary */}
      <Page size="A4" style={styles.page} bookmark="Executive Summary">
        <PageFrame
          systemName={report.systemName}
          sectionName="Executive Summary"
        />
        <Text style={styles.pageEyebrow}>Section 1</Text>
        <Text style={styles.pageTitle}>Executive Summary</Text>
        <View style={styles.pageRule} />
        {report.executiveSummary
          .split(/\n\s*\n/)
          .filter(Boolean)
          .map((para, i) => (
            <Text
              key={i}
              style={i === 0 ? styles.lead : styles.body}
            >
              {para.trim()}
            </Text>
          ))}
      </Page>

      {/* Risk Summary + Heat Map */}
      <Page size="A4" style={styles.page} bookmark="Risk Summary">
        <PageFrame
          systemName={report.systemName}
          sectionName="Risk Summary"
        />
        <Text style={styles.pageEyebrow}>Section 2</Text>
        <Text style={styles.pageTitle}>Risk Summary</Text>
        <View style={styles.pageRule} />

        <Text style={styles.sectionTitle}>Ratings by Dimension</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCellHeader, { flex: 3 }]}>Dimension</Text>
          <Text style={[styles.tableCellHeader, { flex: 1 }]}>Risk Level</Text>
          <Text style={[styles.tableCellHeader, { flex: 1 }]}>Findings</Text>
        </View>
        {report.assessments.map((a, i) => (
          <View
            key={a.personaId}
            style={[
              styles.tableRow,
              i % 2 === 1 ? styles.tableRowAlt : {},
            ]}
          >
            <View
              style={{
                flex: 3,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    DIMENSION_COLORS[a.dimension] ?? color.subtle,
                }}
              />
              <Text style={styles.tableCell}>{a.dimension}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <RiskBadge level={a.overallDimensionRisk} />
            </View>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {a.findings.length}
            </Text>
          </View>
        ))}
        <View style={[styles.tableRow, styles.tableRowTotal]}>
          <Text style={[styles.tableCellBold, { flex: 3 }]}>Overall</Text>
          <View style={{ flex: 1 }}>
            <RiskBadge level={report.overallRisk} />
          </View>
          <Text style={[styles.tableCellBold, { flex: 1 }]}>
            {report.allFindings.length}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Risk Heat Map</Text>
        <View style={styles.heatMap}>
          {report.assessments.map((a) => (
            <View
              key={a.personaId}
              style={[
                styles.heatCell,
                {
                  borderLeftColor:
                    RISK_LEVEL_COLORS[a.overallDimensionRisk] ?? color.subtle,
                },
              ]}
            >
              <Text style={styles.heatCellDim}>{a.dimension}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <RiskBadge level={a.overallDimensionRisk} />
                <Text style={styles.heatCellMeta}>
                  {a.findings.length}{" "}
                  {a.findings.length === 1 ? "finding" : "findings"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {Object.keys(dimensionRisks).length > 0 &&
          Object.entries(dimensionRisks).some(
            ([dim, risk]) =>
              risk !==
              report.assessments.find((a) => a.dimension === dim)
                ?.overallDimensionRisk
          ) && (
            <>
              <Text style={styles.sectionTitle}>Panel-Adjusted Ratings</Text>
              <Text style={styles.body}>
                Synthesis adjusted individual dimension ratings to reflect
                cross-dimensional compounding.
              </Text>
            </>
          )}
      </Page>

      {/* Cross-Dimensional Analysis */}
      {hasCrossPage && (
        <Page
          size="A4"
          style={styles.page}
          bookmark="Cross-Dimensional Analysis"
        >
          <PageFrame
            systemName={report.systemName}
            sectionName="Cross-Dimensional Analysis"
          />
          <Text style={styles.pageEyebrow}>Section 3</Text>
          <Text style={styles.pageTitle}>Cross-Dimensional Analysis</Text>
          <View style={styles.pageRule} />

          {crossIssues.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Compounding Issues</Text>
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
              <Text style={styles.sectionTitle}>Panel Chair Analysis</Text>
              {renderNarrative(report.examinationText, "exam")}
            </>
          )}
        </Page>
      )}

      {/* Findings by Dimension */}
      {report.assessments.map((assessment: PersonaAssessment) => (
        <Page
          key={assessment.personaId}
          size="A4"
          style={styles.page}
          bookmark={`${assessment.dimension} — ${assessment.personaName}`}
        >
          <PageFrame
            systemName={report.systemName}
            sectionName={assessment.dimension}
          />
          <View style={styles.personaStrip}>
            <View
              style={[
                styles.personaDot,
                {
                  backgroundColor:
                    DIMENSION_COLORS[assessment.dimension] ?? color.subtle,
                },
              ]}
            />
            <Text style={styles.personaDim}>{assessment.dimension}</Text>
            <RiskBadge level={assessment.overallDimensionRisk} />
          </View>
          <Text style={styles.pageTitle}>{assessment.personaName}</Text>
          <View style={styles.pageRule} />

          {assessment.narrative && (
            <View style={{ marginBottom: 10 }}>
              {renderNarrative(
                assessment.narrative,
                `narr-${assessment.personaId}`
              )}
            </View>
          )}

          {assessment.findings.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Findings</Text>
              {assessment.findings.map((finding, i) => (
                <View
                  key={finding.id}
                  style={styles.findingBox}
                  wrap={false}
                >
                  <View style={styles.findingHeader}>
                    <Text style={styles.findingTitle}>
                      {i + 1}. {finding.title}
                    </Text>
                    <RiskBadge level={finding.riskLevel} />
                  </View>
                  <Text style={styles.findingBody}>{finding.description}</Text>
                  <Text style={styles.findingRef}>
                    {finding.guidelineReference} · Owner: {finding.suggestedOwner}
                  </Text>
                  <Text style={styles.findingRecLabel}>Recommendation</Text>
                  <Text style={styles.findingRec}>
                    {finding.recommendation}
                  </Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.emptyNote}>
              No structured findings recorded for this dimension. Narrative
              assessment above.
            </Text>
          )}
        </Page>
      ))}

      {/* Prioritised Recommendations */}
      {report.prioritizedRecommendations.length > 0 && (
        <Page
          size="A4"
          style={styles.page}
          bookmark="Prioritised Recommendations"
        >
          <PageFrame
            systemName={report.systemName}
            sectionName="Prioritised Recommendations"
          />
          <Text style={styles.pageEyebrow}>
            Section {hasCrossPage ? "5" : "4"}
          </Text>
          <Text style={styles.pageTitle}>Prioritised Recommendations</Text>
          <View style={styles.pageRule} />

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, { width: 20 }]}>#</Text>
            <Text style={[styles.tableCellHeader, { flex: 3 }]}>Finding</Text>
            <Text style={[styles.tableCellHeader, { flex: 3 }]}>Action</Text>
            <Text style={[styles.tableCellHeader, { flex: 2.2 }]}>Owner</Text>
            <Text style={[styles.tableCellHeader, { width: 40 }]}>Risk</Text>
            <Text style={[styles.tableCellHeader, { width: 60 }]}>Timeline</Text>
          </View>
          {report.prioritizedRecommendations.map((rec, i) => (
            <View
              key={rec.priority}
              style={[
                styles.tableRow,
                i % 2 === 1 ? styles.tableRowAlt : {},
              ]}
              wrap={false}
            >
              <Text style={[styles.tableCell, { width: 20 }]}>
                {rec.priority}
              </Text>
              <View style={{ flex: 3, paddingRight: 6 }}>
                <Text style={styles.tableCellBold}>{rec.findingTitle}</Text>
                <Text style={[styles.tableCell, { color: color.muted, marginTop: 2 }]}>
                  {rec.dimension}
                </Text>
              </View>
              <Text style={[styles.tableCell, { flex: 3, paddingRight: 6 }]}>
                {rec.action}
              </Text>
              <Text style={[styles.tableCell, { flex: 2.2, paddingRight: 6 }]}>
                {rec.suggestedOwner}
              </Text>
              <View style={{ width: 40 }}>
                <RiskBadge level={rec.riskLevel} />
              </View>
              <Text style={[styles.tableCell, { width: 60 }]}>
                {rec.timeline}
              </Text>
            </View>
          ))}
        </Page>
      )}
    </Document>
  );
}
