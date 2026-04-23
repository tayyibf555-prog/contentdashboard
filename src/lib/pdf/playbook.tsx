import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Svg, Rect, Line, Path } from "@react-pdf/renderer";
import type { Playbook } from "@/lib/claude/companion-pdf";

// Register fonts that match the app's aesthetic (Outfit body, Clash display)
Font.register({
  family: "Outfit",
  fonts: [
    { src: `${process.cwd()}/public/fonts/Outfit-Regular.ttf`, fontWeight: 400 },
    { src: `${process.cwd()}/public/fonts/Outfit-Bold.ttf`, fontWeight: 700 },
  ],
});

Font.register({
  family: "Clash Display",
  fonts: [
    { src: `${process.cwd()}/public/fonts/ClashDisplay-Regular.ttf`, fontWeight: 400 },
    { src: `${process.cwd()}/public/fonts/ClashDisplay-Semibold.ttf`, fontWeight: 600 },
    { src: `${process.cwd()}/public/fonts/ClashDisplay-Bold.ttf`, fontWeight: 700 },
  ],
});

const COLORS = {
  bg: "#000000",
  ink: "#FFFFFF",
  muted: "#8E9099",
  line: "#242428",
  accent: "#4A6CF7", // royal blue (matches personal theme)
  panel: "#0A0A0A",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: COLORS.bg,
    color: COLORS.ink,
    padding: 56,
    fontFamily: "Outfit",
    fontSize: 11,
    lineHeight: 1.55,
  },
  eyebrow: {
    fontFamily: "Outfit",
    fontSize: 8,
    letterSpacing: 2.2,
    color: COLORS.muted,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: 700,
  },
  h1: {
    fontFamily: "Clash Display",
    fontWeight: 700,
    fontSize: 48,
    lineHeight: 1.05,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  h2: {
    fontFamily: "Clash Display",
    fontWeight: 600,
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  h3: {
    fontFamily: "Clash Display",
    fontWeight: 600,
    fontSize: 18,
    marginBottom: 8,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#D8DBE4",
    marginBottom: 8,
  },
  subtle: {
    fontSize: 10,
    color: COLORS.muted,
  },
  sectionNumber: {
    fontFamily: "Clash Display",
    fontWeight: 600,
    fontSize: 54,
    color: COLORS.accent,
    lineHeight: 1,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.line,
    marginVertical: 18,
  },
  accentBox: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.accent,
    paddingLeft: 12,
    paddingVertical: 2,
    marginBottom: 10,
  },
  pageFooter: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 9,
    color: COLORS.muted,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 12,
  },
  keywordPill: {
    alignSelf: "flex-start",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 24,
  },
  coverBloom: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 420,
    height: 420,
    backgroundColor: COLORS.accent,
    opacity: 0.18,
    borderRadius: 9999,
  },
  ctaCard: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 28,
    borderRadius: 10,
    marginTop: 20,
  },
});

function PageFooter({ pageNumber, handle }: { pageNumber: number; handle: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text>{handle}</Text>
      <Text>— {String(pageNumber).padStart(2, "0")} —</Text>
    </View>
  );
}

function FrameworkDiagram({ nodes }: { nodes: Array<{ label: string; number: number }> }) {
  const boxW = 88;
  const boxH = 62;
  const gap = 14;
  const totalW = nodes.length * boxW + (nodes.length - 1) * gap;
  const canvasW = 460;
  const startX = Math.max(0, (canvasW - totalW) / 2);
  const canvasH = 100;

  return (
    <Svg width={canvasW} height={canvasH} viewBox={`0 0 ${canvasW} ${canvasH}`}>
      {nodes.map((n, i) => {
        const x = startX + i * (boxW + gap);
        const y = (canvasH - boxH) / 2;
        return (
          <React.Fragment key={i}>
            <Rect
              x={x}
              y={y}
              width={boxW}
              height={boxH}
              rx={8}
              ry={8}
              fill={COLORS.panel}
              stroke={COLORS.accent}
              strokeWidth={1.2}
            />
            <Text
              x={x + boxW / 2}
              y={y + 26}
              style={{ fontSize: 10, fontFamily: "Clash Display", fontWeight: 700 }}
              textAnchor="middle"
              fill={COLORS.accent}
            >
              {String(n.number).padStart(2, "0")}
            </Text>
            <Text
              x={x + boxW / 2}
              y={y + 44}
              style={{ fontSize: 9, fontFamily: "Outfit", fontWeight: 600 }}
              textAnchor="middle"
              fill={COLORS.ink}
            >
              {n.label.length > 16 ? n.label.slice(0, 14) + "…" : n.label}
            </Text>
            {i < nodes.length - 1 && (
              <>
                <Line
                  x1={x + boxW}
                  y1={y + boxH / 2}
                  x2={x + boxW + gap}
                  y2={y + boxH / 2}
                  stroke={COLORS.accent}
                  strokeWidth={1.4}
                />
                <Path
                  d={`M ${x + boxW + gap - 4} ${y + boxH / 2 - 3} L ${x + boxW + gap} ${y + boxH / 2} L ${x + boxW + gap - 4} ${y + boxH / 2 + 3}`}
                  fill="none"
                  stroke={COLORS.accent}
                  strokeWidth={1.4}
                />
              </>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export function PlaybookDoc({
  playbook,
  handle,
}: {
  playbook: Playbook;
  handle: string;
}) {
  const {
    title, subtitle, keyword, overview, sections,
    framework_type, framework_nodes, outro, cta,
  } = playbook;

  return (
    <Document title={title}>
      {/* ─── COVER ──────────────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <View style={s.coverBloom} />
        <Text style={s.eyebrow}>Playbook · {handle}</Text>
        <Text style={s.h1}>{title}</Text>
        <Text style={{ ...s.body, fontSize: 13, marginBottom: 20 }}>{subtitle}</Text>

        <View style={s.divider} />

        <View style={{ flex: 1 }} />

        <View style={s.keywordPill}>
          <Text>#{keyword}</Text>
        </View>

        <Text style={{ ...s.subtle, marginTop: 16 }}>
          You asked for this playbook. Here&apos;s the full breakdown — with the depth the social post couldn&apos;t fit.
        </Text>

        <PageFooter pageNumber={1} handle={handle} />
      </Page>

      {/* ─── OVERVIEW + CONTENTS ─────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>Overview</Text>
        <Text style={s.h2}>What this playbook covers.</Text>
        {overview.split(/\n+/).map((p, i) => (
          <Text key={i} style={s.body}>{p}</Text>
        ))}

        <View style={s.divider} />

        <Text style={s.eyebrow}>Contents</Text>
        <View style={{ marginTop: 6 }}>
          {sections.map((sec) => (
            <View key={sec.number} style={{ flexDirection: "row", marginBottom: 8 }}>
              <Text style={{ ...s.body, width: 28, color: COLORS.accent, fontWeight: 700 }}>
                {String(sec.number).padStart(2, "0")}
              </Text>
              <Text style={{ ...s.body, flex: 1, color: COLORS.ink }}>{sec.title}</Text>
            </View>
          ))}
        </View>

        <PageFooter pageNumber={2} handle={handle} />
      </Page>

      {/* ─── SECTIONS ────────────────────────────────────────── */}
      {sections.map((sec, i) => (
        <Page key={sec.number} size="A4" style={s.page}>
          <Text style={s.eyebrow}>Section {String(sec.number).padStart(2, "0")} of {String(sections.length).padStart(2, "0")}</Text>
          <Text style={s.sectionNumber}>{String(sec.number).padStart(2, "0")}</Text>
          <Text style={s.h2}>{sec.title}</Text>
          <View style={s.divider} />

          {sec.body.split(/\n+/).map((p, j) => (
            <Text key={j} style={s.body}>{p}</Text>
          ))}

          {sec.example && (
            <View style={s.accentBox}>
              <Text style={{ ...s.eyebrow, marginBottom: 3 }}>Example</Text>
              <Text style={{ ...s.body, color: COLORS.ink, marginBottom: 0 }}>{sec.example}</Text>
            </View>
          )}

          <View style={s.accentBox}>
            <Text style={{ ...s.eyebrow, marginBottom: 3 }}>Do this today</Text>
            <Text style={{ ...s.body, color: COLORS.ink, marginBottom: 0 }}>{sec.action}</Text>
          </View>

          <PageFooter pageNumber={3 + i} handle={handle} />
        </Page>
      ))}

      {/* ─── FRAMEWORK DIAGRAM (only when sequential) ────────── */}
      {framework_type === "sequential" && framework_nodes.length >= 3 && (
        <Page size="A4" style={s.page}>
          <Text style={s.eyebrow}>Framework</Text>
          <Text style={s.h2}>The flow at a glance.</Text>
          <View style={s.divider} />
          <Text style={{ ...s.body, marginBottom: 24 }}>
            The process above follows this order. Save this page — it&apos;s the map you can reference whenever you lose the thread.
          </Text>
          <FrameworkDiagram nodes={framework_nodes} />
          <PageFooter pageNumber={3 + sections.length} handle={handle} />
        </Page>
      )}

      {/* ─── CTA BACK PAGE ───────────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>One more thing</Text>
        <Text style={s.h2}>Now go execute.</Text>
        <View style={s.divider} />

        {outro.split(/\n+/).map((p, i) => (
          <Text key={i} style={s.body}>{p}</Text>
        ))}

        <View style={s.ctaCard}>
          <Text style={{ ...s.h3, color: COLORS.accent, marginBottom: 6 }}>Your next step</Text>
          <Text style={{ ...s.body, color: COLORS.ink, fontSize: 13 }}>{cta}</Text>
        </View>

        <View style={{ flex: 1 }} />
        <Text style={{ ...s.subtle, textAlign: "center" }}>{handle}</Text>
      </Page>
    </Document>
  );
}
