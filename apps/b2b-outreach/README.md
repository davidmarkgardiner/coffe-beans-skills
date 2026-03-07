# B2B Local Outreach — Stockbridge Coffee 🏪

## The "Neighbourhood" Strategy

Target local businesses in Edinburgh (EH3/EH4 postcodes) for wholesale/office coffee supply.

## Target Segments

| Segment | Why | Approach |
|---------|-----|----------|
| **Boutique hotels** | Daily coffee service, premium positioning | Free sample + meeting |
| **Co-working spaces** | High volume, recurring | Free trial week |
| **Independent cafes** | Wholesale supply | Sample roast + pricing |
| **Offices (20+ staff)** | Break room supply, recurring | Free sample box |
| **Delis & food shops** | Retail shelf placement | Consignment trial |

## Lead Generation

### Google Maps Scraper
Use the Apify lead generation skill to find local businesses:
```bash
# Find cafes, hotels, offices in Stockbridge/Edinburgh EH3/EH4
~/clawd/skills/apify-leads/scripts/search.sh \
  --query "cafes near Stockbridge Edinburgh" \
  --location "Edinburgh, Scotland" \
  --limit 50
```

### Manual Priority List
Known targets in the Stockbridge area:
1. The Pantry (Stockbridge cafe)
2. Herbie of Edinburgh (deli)
3. IJ Mellis Cheesemonger (premium food)
4. Stockbridge Tap (pub)
5. The Raeburn (boutique hotel)

## Outreach Templates

### Email Template: Free Sample Offer
```
Subject: Fresh-roasted coffee from your neighbour in Stockbridge

Hi [Name],

I'm David from Stockbridge Coffee — we roast small-batch single-origin
Honduran beans right here in the neighbourhood.

We'd love to drop off a complimentary bag for your [team/guests/customers]
to try. No strings attached — just good coffee from a local roaster.

Would that be of interest? Happy to pop by whenever suits.

Best,
David
Stockbridge Coffee
stockbridgecoffee.co.uk
```

## Workflow
1. **Lead gen:** Scrape Google Maps for EH3/EH4 businesses (Codex/market-research)
2. **Qualify:** Filter for relevant segments (Scotty)
3. **Draft emails:** Personalised outreach per business (Scotty/email-mgr)
4. **David reviews:** All outreach goes to draft, David approves before send
5. **Follow up:** Track responses, schedule sample deliveries
6. **Convert:** Move to wholesale pricing discussion

## Tools
- Apify lead generation skill for scraping
- Gmail draft tool for email outreach
- Vikunja for tracking leads pipeline
- Firestore for lead database
