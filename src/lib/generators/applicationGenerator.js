function formatDate(dateStr) {
  if (!dateStr) return "________________";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function numberedList(items = []) {
  if (!items.length) return "N/A";
  return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
}

function orBlank(value, placeholder = "________________") {
  return value?.trim() || placeholder;
}

function generatePostArrestBail(data) {
  const {
    courtName,
    courtType,
    caseTitle,
    caseNumber,
    firNo,
    applicantName,
    respondentName,
    ppcSections = [],
    judgeName,
    hearingDate,
    grounds = [],
    prayer,
    additionalNotes,
  } = data;

  const sections = ppcSections.length
    ? ppcSections.join(", ")
    : "________________";

  return `
IN THE ${orBlank(courtType, "HONOURABLE COURT").toUpperCase()}
${orBlank(courtName).toUpperCase()}

Case Title: ${orBlank(caseTitle)}
Case No.: ${orBlank(caseNumber)}
FIR No.: ${orBlank(firNo)}
Under Sections: ${sections}

─────────────────────────────────────────────
APPLICATION FOR POST-ARREST BAIL
─────────────────────────────────────────────

BEFORE THE HON'BLE MR. / MS. JUSTICE ${orBlank(judgeName).toUpperCase()}

APPLICANT (ACCUSED):
${orBlank(applicantName)}

VERSUS

RESPONDENT / STATE:
${orBlank(respondentName, "The State")}

─────────────────────────────────────────────
RESPECTFUL SUBMISSION
─────────────────────────────────────────────

Most Respectfully Showeth:

That the Applicant, ${orBlank(applicantName)}, has been placed under arrest in connection with Case No. ${orBlank(caseNumber)} registered at FIR No. ${orBlank(firNo)} under Sections ${sections} of the Pakistan Penal Code / relevant laws. The Applicant approaches this Honourable Court for grant of post-arrest bail on the following grounds:

─────────────────────────────────────────────
GROUNDS
─────────────────────────────────────────────

${numberedList(grounds)}

─────────────────────────────────────────────
PRAYER
─────────────────────────────────────────────

It is therefore most respectfully prayed that this Honourable Court may graciously be pleased to:

${orBlank(prayer, `Grant post-arrest bail to the Applicant, ${orBlank(applicantName)}, on such surety as this Court may deem appropriate, in the interest of justice.`)}

${
  additionalNotes
    ? `─────────────────────────────────────────────
ADDITIONAL SUBMISSIONS
─────────────────────────────────────────────

${additionalNotes}`
    : ""
}

─────────────────────────────────────────────
VERIFICATION
─────────────────────────────────────────────

Verified that the above contents are true and correct to the best of the deponent's knowledge and belief. Nothing has been concealed.

Date: ${formatDate(hearingDate)}

                                    Respectfully submitted,

                                    ______________________________
                                    Counsel for the Applicant / Accused
                                    ${orBlank(courtName)}
`.trim();
}

function generatePreArrestBail(data) {
  const {
    courtName,
    courtType,
    caseTitle,
    caseNumber,
    firNo,
    applicantName,
    respondentName,
    ppcSections = [],
    judgeName,
    hearingDate,
    grounds = [],
    prayer,
    additionalNotes,
  } = data;

  const sections = ppcSections.length
    ? ppcSections.join(", ")
    : "________________";

  return `
IN THE ${orBlank(courtType, "HONOURABLE COURT").toUpperCase()}
${orBlank(courtName).toUpperCase()}

Case Title: ${orBlank(caseTitle)}
FIR No.: ${orBlank(firNo)}
Under Sections: ${sections}

─────────────────────────────────────────────
APPLICATION FOR PRE-ARREST / ANTICIPATORY BAIL
─────────────────────────────────────────────

BEFORE THE HON'BLE MR. / MS. JUSTICE ${orBlank(judgeName).toUpperCase()}

APPLICANT:
${orBlank(applicantName)}

VERSUS

RESPONDENT / STATE:
${orBlank(respondentName, "The State")}

─────────────────────────────────────────────
RESPECTFUL SUBMISSION
─────────────────────────────────────────────

Most Respectfully Showeth:

That the Applicant, ${orBlank(applicantName)}, apprehends arrest in connection with FIR No. ${orBlank(firNo)} registered under Sections ${sections}. The Applicant invokes the jurisdiction of this Honourable Court under Section 498 Cr.P.C. for the grant of pre-arrest (anticipatory) bail on the following grounds:

─────────────────────────────────────────────
GROUNDS
─────────────────────────────────────────────

${numberedList(grounds)}

─────────────────────────────────────────────
PRAYER
─────────────────────────────────────────────

${orBlank(prayer, `It is most respectfully prayed that this Honourable Court may be pleased to grant pre-arrest bail to the Applicant, ${orBlank(applicantName)}, in the event of arrest, on such terms as this Court deems fit.`)}

${
  additionalNotes
    ? `─────────────────────────────────────────────
ADDITIONAL SUBMISSIONS
─────────────────────────────────────────────

${additionalNotes}`
    : ""
}

Date: ${formatDate(hearingDate)}

                                    Respectfully submitted,

                                    ______________________________
                                    Counsel for the Applicant
                                    ${orBlank(courtName)}
`.trim();
}

function generateCivilSuit(data) {
  const {
    courtName,
    courtType,
    caseTitle,
    caseNumber,
    applicantName,
    respondentName,
    judgeName,
    hearingDate,
    grounds = [],
    prayer,
    additionalNotes,
  } = data;

  return `
IN THE ${orBlank(courtType, "CIVIL COURT").toUpperCase()}
${orBlank(courtName).toUpperCase()}

Suit No.: ${orBlank(caseNumber)}
Case Title: ${orBlank(caseTitle)}

─────────────────────────────────────────────
CIVIL SUIT / PLAINT
─────────────────────────────────────────────

BEFORE THE HON'BLE MR. / MS. JUSTICE ${orBlank(judgeName).toUpperCase()}

PLAINTIFF:
${orBlank(applicantName)}

VERSUS

DEFENDANT:
${orBlank(respondentName)}

─────────────────────────────────────────────
CAUSE OF ACTION & FACTS
─────────────────────────────────────────────

Most Respectfully Showeth:

That the Plaintiff, ${orBlank(applicantName)}, institutes this civil suit against the Defendant, ${orBlank(respondentName)}, on the following grounds and facts, establishing a clear cause of action:

${numberedList(grounds)}

─────────────────────────────────────────────
LEGAL BASIS
─────────────────────────────────────────────

The Plaintiff submits that the above facts establish a clear and actionable legal claim cognisable by this Honourable Court under the applicable provisions of law.

─────────────────────────────────────────────
RELIEF SOUGHT / PRAYER
─────────────────────────────────────────────

It is most respectfully prayed that this Honourable Court may be pleased to:

${orBlank(prayer, `Pass a decree in favour of the Plaintiff, ${orBlank(applicantName)}, against the Defendant, ${orBlank(respondentName)}, in the terms set out herein, along with costs of the suit.`)}

${
  additionalNotes
    ? `─────────────────────────────────────────────
ADDITIONAL SUBMISSIONS
─────────────────────────────────────────────

${additionalNotes}`
    : ""
}

─────────────────────────────────────────────
VERIFICATION
─────────────────────────────────────────────

I, ${orBlank(applicantName)}, do hereby solemnly verify that the contents of this plaint are true and correct to the best of my knowledge and belief, and nothing material has been concealed.

Date: ${formatDate(hearingDate)}                 Place: ${orBlank(courtName)}

                                    Respectfully submitted,

                                    ______________________________
                                    Plaintiff / Counsel for Plaintiff
`.trim();
}

function generateAdjournment(data) {
  const {
    courtName,
    courtType,
    caseTitle,
    caseNumber,
    applicantName,
    respondentName,
    judgeName,
    hearingDate,
    grounds = [],
    prayer,
  } = data;

  return `
IN THE ${orBlank(courtType, "HONOURABLE COURT").toUpperCase()}
${orBlank(courtName).toUpperCase()}

Case Title: ${orBlank(caseTitle)}
Case No.: ${orBlank(caseNumber)}

─────────────────────────────────────────────
APPLICATION FOR ADJOURNMENT
─────────────────────────────────────────────

BEFORE THE HON'BLE MR. / MS. JUSTICE ${orBlank(judgeName).toUpperCase()}

APPLICANT:
${orBlank(applicantName)}

VERSUS

RESPONDENT:
${orBlank(respondentName)}

─────────────────────────────────────────────
RESPECTFUL SUBMISSION
─────────────────────────────────────────────

Most Respectfully Showeth:

That the Applicant humbly seeks an adjournment of the hearing scheduled for ${formatDate(hearingDate)} on the following grounds:

${numberedList(grounds)}

─────────────────────────────────────────────
PRAYER
─────────────────────────────────────────────

${orBlank(prayer, "It is most respectfully prayed that this Honourable Court may graciously adjourn the matter to a date convenient to the Court, in the interest of justice.")}

Date: ${formatDate(hearingDate)}

                                    Respectfully submitted,

                                    ______________________________
                                    Counsel for Applicant
`.trim();
}

function generateExemption(data) {
  const {
    courtName,
    courtType,
    caseTitle,
    caseNumber,
    applicantName,
    respondentName,
    judgeName,
    hearingDate,
    grounds = [],
    prayer,
  } = data;

  return `
IN THE ${orBlank(courtType, "HONOURABLE COURT").toUpperCase()}
${orBlank(courtName).toUpperCase()}

Case Title: ${orBlank(caseTitle)}
Case No.: ${orBlank(caseNumber)}

─────────────────────────────────────────────
APPLICATION FOR EXEMPTION FROM PERSONAL APPEARANCE
─────────────────────────────────────────────

BEFORE THE HON'BLE MR. / MS. JUSTICE ${orBlank(judgeName).toUpperCase()}

APPLICANT / ACCUSED:
${orBlank(applicantName)}

VERSUS

RESPONDENT / STATE:
${orBlank(respondentName, "The State")}

─────────────────────────────────────────────
RESPECTFUL SUBMISSION
─────────────────────────────────────────────

Most Respectfully Showeth:

That the Applicant, ${orBlank(applicantName)}, is unable to appear personally before this Honourable Court on ${formatDate(hearingDate)} for the following reasons:

${numberedList(grounds)}

─────────────────────────────────────────────
PRAYER
─────────────────────────────────────────────

${orBlank(prayer, `It is most respectfully prayed that this Honourable Court may graciously grant exemption from personal appearance to the Applicant, ${orBlank(applicantName)}, on ${formatDate(hearingDate)}, and permit appearance through Counsel.`)}

Date: ${formatDate(hearingDate)}

                                    Respectfully submitted,

                                    ______________________________
                                    Counsel for Applicant / Accused
                                    ${orBlank(courtName)}
`.trim();
}

function generateMiscellaneous(data) {
  const {
    courtName,
    courtType,
    caseTitle,
    caseNumber,
    applicantName,
    respondentName,
    judgeName,
    hearingDate,
    grounds = [],
    prayer,
    additionalNotes,
  } = data;

  return `
IN THE ${orBlank(courtType, "HONOURABLE COURT").toUpperCase()}
${orBlank(courtName).toUpperCase()}

Case Title: ${orBlank(caseTitle)}
Case No.: ${orBlank(caseNumber)}

─────────────────────────────────────────────
MISCELLANEOUS APPLICATION
─────────────────────────────────────────────

BEFORE THE HON'BLE MR. / MS. JUSTICE ${orBlank(judgeName).toUpperCase()}

APPLICANT:
${orBlank(applicantName)}

VERSUS

RESPONDENT:
${orBlank(respondentName)}

─────────────────────────────────────────────
RESPECTFUL SUBMISSION
─────────────────────────────────────────────

Most Respectfully Showeth:

${numberedList(grounds)}

─────────────────────────────────────────────
PRAYER
─────────────────────────────────────────────

${orBlank(prayer, "It is most respectfully prayed that this Honourable Court may be pleased to pass such orders as it deems fit in the circumstances of the case.")}

${
  additionalNotes
    ? `─────────────────────────────────────────────
ADDITIONAL SUBMISSIONS
─────────────────────────────────────────────

${additionalNotes}`
    : ""
}

Date: ${formatDate(hearingDate)}

                                    Respectfully submitted,

                                    ______________________________
                                    Counsel for Applicant
                                    ${orBlank(courtName)}
`.trim();
}

const GENERATORS = {
  post_arrest_bail: generatePostArrestBail,
  pre_arrest_bail: generatePreArrestBail,
  civil_suit: generateCivilSuit, // New type added by this upgrade
  adjournment: generateAdjournment,
  exemption: generateExemption,
  miscellaneous: generateMiscellaneous,
};

export function getSupportedTypes() {
  return [
    { value: "post_arrest_bail", label: "Post-Arrest Bail Application" },
    { value: "pre_arrest_bail", label: "Pre-Arrest / Anticipatory Bail" },
    { value: "civil_suit", label: "Civil Suit / Plaint" },
    { value: "adjournment", label: "Adjournment Application" },
    { value: "exemption", label: "Exemption from Personal Appearance" },
    { value: "placement_of_documents", label: "Placement of Documents" },
    { value: "substitute_witness", label: "Substitute Witness Application" },
    { value: "miscellaneous", label: "Miscellaneous Application" },
  ];
}

export function generateApplication({ type, data }) {
  const generator = GENERATORS[type];

  if (!generator) {
    return {
      ok: false,
      error: `No template available for application type: "${type}". Supported types: ${Object.keys(GENERATORS).join(", ")}`,
    };
  }

  try {
    const content = generator(data);
    return { ok: true, content };
  } catch (err) {
    return {
      ok: false,
      error: `Template generation failed: ${err.message}`,
    };
  }
}
