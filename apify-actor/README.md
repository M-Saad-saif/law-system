# Pakistan Court Judgments – Apify Actor

Puppeteer-based web scraper that collects judgments from five Pakistani superior courts.

## Courts covered

| Abbreviation | Court                     | Province    |
| ------------ | ------------------------- | ----------- |
| SCP          | Supreme Court of Pakistan | Federal     |
| LHC          | Lahore High Court         | Punjab      |
| IHC          | Islamabad High Court      | Islamabad   |
| PHC          | Peshawar High Court       | KPK         |
| BHC          | High Court of Balochistan | Balochistan |

## Input schema

```json
{
  "courts": ["SCP", "LHC", "IHC", "PHC", "BHC"],
  "maxResultsPerCourt": 50
}
```

## Output schema (one item per judgment)

```json
{
  "title": "Muhammad Ali v. The State",
  "court": "SCP",
  "courtFull": "Supreme Court of Pakistan",
  "courtAbbr": "SCP",
  "province": "Federal",
  "citation": "2024 SCMR 123",
  "judge": "Justice Yahya Afridi",
  "matter": "Criminal",
  "orderDate": "2024-03-15T00:00:00.000Z",
  "sourceUrl": "https://scp.gov.pk/judgments/xyz.pdf",
  "approved": true,
  "fetchedAt": "2024-06-01T03:00:00.000Z"
}
```

## Local development

```bash
cd apify-actor
npm install
npx apify-cli run --input='{"courts":["SCP"],"maxResultsPerCourt":5}'
```
