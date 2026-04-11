import JudgmentAlert from "@/models/JudgmentAlert";

export const seedIntelligenceFeed = async () => {
  await JudgmentAlert.deleteMany({});

  const alerts = [
    {
      title: "Muhammad Aslam v. State — 302 PPC Bail Refused",
      court: "Lahore High Court",
      ppcSections: ["302", "34"],
      caseType: "Bail",
      outcome: "Bail Refused",
      judgeName: "Justice Anwaarul Haq Pannun",
      decisionDate: new Date("2024-11-20"),
      summary:
        "Bail in murder case under Section 302 PPC refused on grounds of recovered weapon and eye-witness statements. Court reiterated that concurrent evidence creates a reasonable nexus warranting custody.",
      headnote:
        "Bail in capital offence requires exceptional grounds; recovery of weapon + ocular evidence sufficient to refuse.",
      importance: "High",
      tags: ["Murder", "Bail", "302 PPC", "Evidence"],
      sourceUrl: "https://www.supremecourt.gov.pk",
      isActive: true,
    },
    {
      title: "State v. Tariq Mehmood — 302 PPC Bail Granted (Post-Arrest)",
      court: "Sindh High Court",
      ppcSections: ["302"],
      caseType: "Bail",
      outcome: "Bail Granted",
      judgeName: "Justice Naimatullah Phulpoto",
      decisionDate: new Date("2024-10-05"),
      summary:
        "Bail granted in a 302 case where the sole eye-witness had prior enmity with the accused. Court held that veracious doubt exists when the only witness is an interested party.",
      headnote:
        "Sole interested witness with motive to falsely implicate — sufficient doubt for bail in capital offence.",
      importance: "High",
      tags: ["Murder", "Bail", "302 PPC", "Interested Witness"],
      sourceUrl: "https://sindhhighcourt.gov.pk",
      isActive: true,
    },
    {
      title: "Naveed Ahmed v. NAB — White-Collar Bail Principles",
      court: "Supreme Court",
      ppcSections: ["9", "10"],
      caseType: "Bail",
      outcome: "Bail Granted",
      judgeName: "Justice Munib Akhtar",
      decisionDate: new Date("2024-09-14"),
      summary:
        "Supreme Court reaffirmed that long pre-trial detention in financial crime cases violates Article 10-A. Bail should not be withheld as a pre-conviction punishment.",
      headnote:
        "Prolonged pre-trial detention in NAB matters inconsistent with fair trial rights under Article 10-A.",
      importance: "High",
      tags: ["NAB", "Financial Crime", "Bail", "Article 10-A", "Fair Trial"],
      sourceUrl: "https://www.supremecourt.gov.pk",
      isActive: true,
    },
    {
      title: "Imran Khan v. FIA — Cyber Crime Bail Framework",
      court: "Islamabad High Court",
      ppcSections: ["20"],
      caseType: "Bail",
      outcome: "Bail Granted",
      judgeName: "Justice Miangul Hassan Aurangzeb",
      decisionDate: new Date("2024-08-30"),
      summary:
        "IHC clarified that first-time offenders under PECA 2016 should ordinarily be granted bail absent evidence of flight risk or repeat conduct. Court emphasized proportionality.",
      headnote:
        "PECA first-time offence + no flight risk = bail ordinarily must be granted.",
      importance: "Medium",
      tags: ["Cyber Crime", "PECA", "Bail", "First Offender"],
      sourceUrl: "https://www.ihc.gov.pk",
      isActive: true,
    },
    {
      title: "Saeed Akhtar v. State — 489-F Cheque Dishonour Conviction Upheld",
      court: "Lahore High Court",
      ppcSections: ["489-F"],
      caseType: "Criminal",
      outcome: "Appeal Dismissed",
      judgeName: "Justice Shahid Bilal Hassan",
      decisionDate: new Date("2024-12-01"),
      summary:
        "Appeal against conviction under Section 489-F dismissed. Court held that issuance of a cheque without sufficient funds raises a rebuttable presumption of dishonest intent.",
      headnote:
        "Dishonest issuance under 489-F — prosecution need only prove issuance; burden of rebuttal shifts to accused.",
      importance: "Medium",
      tags: ["489-F", "Cheque", "Financial", "Presumption"],
      sourceUrl: "https://lhc.gov.pk",
      isActive: true,
    },
    {
      title: "Gulshan Bibi v. State — Domestic Violence Protective Order",
      court: "Sindh High Court",
      ppcSections: ["337-A"],
      caseType: "Family",
      outcome: "Appeal Allowed",
      judgeName: "Justice Adnan ul Karim Memon",
      decisionDate: new Date("2024-11-10"),
      summary:
        "Court issued suo motu notice and allowed appeal of victim, directing session courts to expedite Domestic Violence (Prevention & Protection) Act applications within 15 days.",
      headnote:
        "Session courts must decide DV Act protective order applications within 15 days — delay amounts to denial of justice.",
      importance: "High",
      tags: ["Domestic Violence", "Family Law", "Protective Order", "Women"],
      sourceUrl: "https://sindhhighcourt.gov.pk",
      isActive: true,
    },
  ];

  await JudgmentAlert.insertMany(alerts);
  console.log("Intelligence Feed seeded:", alerts.length, "alerts");
};
