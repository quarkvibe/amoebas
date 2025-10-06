# Amoeba API Integration Guide

## Overview

Amoeba is an intelligent email operations and content generation microservice with a comprehensive horoscope API. This guide is for external systems, AI models, and applications that need to integrate with Amoeba to access daily horoscopes and astronomical data.

**Base URL:** `https://your-domain.replit.dev` (replace with your actual deployment URL)

**API Version:** 1.0

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Data Structures](#data-structures)
4. [Webhooks](#webhooks)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Best Practices](#best-practices)
8. [Support](#support)

---

## Authentication

All horoscope API endpoints require authentication using an API key.

### Obtaining an API Key

API keys must be generated through the Amoeba dashboard:

1. Log in to the Amoeba dashboard
2. Navigate to Settings → API Keys
3. Click "Generate New API Key"
4. Provide a name and select permissions (e.g., `read:horoscopes`)
5. Save the generated key securely (it's only shown once)

### Using API Keys

Include the API key in the `Authorization` header of all requests:

```http
Authorization: Bearer amoeba_your_api_key_here
```

### API Key Format

API keys follow this format:
- **Prefix:** `amoeba_`
- **Hash:** 64 hexadecimal characters
- **Example:** `amoeba_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

### Permissions

API keys support granular permissions:
- `read:horoscopes` - Read access to horoscope data
- `write:horoscopes` - Generate horoscopes (admin only)
- `*` - Full access (admin only)

---

## API Endpoints

### 1. Get All Horoscopes for Today

Retrieve horoscopes for all 12 zodiac signs for the current date.

**Endpoint:** `GET /api/horoscopes/today`

**Authentication:** Required (`read:horoscopes`)

**Request:**
```bash
curl -X GET https://your-domain.replit.dev/api/horoscopes/today \
  -H "Authorization: Bearer amoeba_your_api_key_here"
```

**Response:** `200 OK`
```json
{
  "date": "2025-10-06",
  "horoscopes": [
    {
      "id": "f2865fab-2353-486f-83f2-9e851e24a9cc",
      "zodiacSignId": "leo",
      "date": "2025-10-06",
      "content": "The cosmic energies are aligning for Leo today, bringing opportunities for growth and positive change. Mars in your career sector suggests bold professional moves will pay off."
    },
    {
      "id": "a5087b92-a2c3-460c-a9cc-8fec879c8e1d",
      "zodiacSignId": "aries",
      "date": "2025-10-06",
      "content": "Aries, your natural leadership shines today as Jupiter aligns favorably..."
    }
    // ... 10 more signs
  ]
}
```

---

### 2. Get Horoscope for Specific Sign

Retrieve the horoscope for a specific zodiac sign for today.

**Endpoint:** `GET /api/horoscopes/:sign`

**Authentication:** Required (`read:horoscopes`)

**URL Parameters:**
- `sign` (string, required) - Zodiac sign name (lowercase)
  - Valid values: `aries`, `taurus`, `gemini`, `cancer`, `leo`, `virgo`, `libra`, `scorpio`, `sagittarius`, `capricorn`, `aquarius`, `pisces`

**Request:**
```bash
curl -X GET https://your-domain.replit.dev/api/horoscopes/leo \
  -H "Authorization: Bearer amoeba_your_api_key_here"
```

**Response:** `200 OK`
```json
{
  "sign": "leo",
  "date": "2025-10-06",
  "horoscope": {
    "id": "f2865fab-2353-486f-83f2-9e851e24a9cc",
    "zodiacSignId": "leo",
    "date": "2025-10-06",
    "content": "The cosmic energies are aligning for Leo today, bringing opportunities for growth and positive change. Mars in your career sector suggests bold professional moves will pay off."
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Horoscope not found for leo on 2025-10-06"
}
```

---

### 3. Trigger Horoscope Generation (Admin Only)

Manually trigger horoscope generation for a specific date.

**Endpoint:** `POST /api/cron/trigger-horoscopes`

**Authentication:** Required (Authenticated user session)

**Request Body:**
```json
{
  "date": "2025-10-07"  // Optional, defaults to today
}
```

**Request:**
```bash
curl -X POST https://your-domain.replit.dev/api/cron/trigger-horoscopes \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{"date": "2025-10-07"}'
```

**Response:** `200 OK`
```json
{
  "message": "Horoscope generation triggered successfully",
  "date": "2025-10-07",
  "completed": 12
}
```

---

### 4. Test Horoscope Generation (Development Only)

Generate horoscopes for testing purposes. Only available in development environment.

**Endpoint:** `POST /api/test/generate-horoscopes`

**Authentication:** None required (Development only)

**Request Body:**
```json
{
  "date": "2025-10-07"  // Optional, defaults to today
}
```

**Request:**
```bash
curl -X POST http://localhost:5000/api/test/generate-horoscopes \
  -H "Content-Type: application/json" \
  -d '{"date": "2025-10-07"}'
```

**Response:** `200 OK`
```json
{
  "message": "Horoscope generation test completed",
  "date": "2025-10-07"
}
```

---

## Data Structures

### Horoscope Object

```typescript
{
  id: string;              // UUID
  zodiacSignId: string;    // Zodiac sign identifier (lowercase)
  date: string;            // ISO date format (YYYY-MM-DD)
  content: string;         // Generated horoscope text (150-200 words)
}
```

### Zodiac Signs

The following zodiac sign identifiers are supported:

| Sign ID | Name | Symbol | Date Range |
|---------|------|--------|------------|
| `aries` | Aries | ♈ | Mar 21 - Apr 19 |
| `taurus` | Taurus | ♉ | Apr 20 - May 20 |
| `gemini` | Gemini | ♊ | May 21 - Jun 20 |
| `cancer` | Cancer | ♋ | Jun 21 - Jul 22 |
| `leo` | Leo | ♌ | Jul 23 - Aug 22 |
| `virgo` | Virgo | ♍ | Aug 23 - Sep 22 |
| `libra` | Libra | ♎ | Sep 23 - Oct 22 |
| `scorpio` | Scorpio | ♏ | Oct 23 - Nov 21 |
| `sagittarius` | Sagittarius | ♐ | Nov 22 - Dec 21 |
| `capricorn` | Capricorn | ♑ | Dec 22 - Jan 19 |
| `aquarius` | Aquarius | ♒ | Jan 20 - Feb 18 |
| `pisces` | Pisces | ♓ | Feb 19 - Mar 20 |

---

## Webhooks

Amoeba can send real-time notifications when horoscopes are generated.

### Webhook Events

- `horoscopes.daily_complete` - Triggered when all 12 daily horoscopes are generated

### Webhook Payload

```json
{
  "event": "horoscopes.daily_complete",
  "data": {
    "date": "2025-10-06",
    "completedCount": 12,
    "totalSigns": 12,
    "timestamp": "2025-10-06T00:05:32.123Z"
  },
  "signature": "sha256_signature_for_verification"
}
```

### Setting Up Webhooks

1. Register your webhook URL through the Amoeba dashboard
2. Verify webhook signature using the provided secret
3. Respond with `200 OK` within 5 seconds

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | API key lacks required permissions |
| 404 | Not Found | Horoscope not found for requested sign/date |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error occurred |

### Error Response Format

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": {}  // Optional additional information
}
```

### Common Errors

**Invalid API Key:**
```json
{
  "error": "Invalid or expired API key"
}
```

**Missing Permissions:**
```json
{
  "error": "API key does not have required permission: read:horoscopes"
}
```

**Horoscope Not Found:**
```json
{
  "error": "Horoscope not found for leo on 2025-10-06"
}
```

---

## Code Examples

### JavaScript/Node.js

```javascript
const API_KEY = 'amoeba_your_api_key_here';
const BASE_URL = 'https://your-domain.replit.dev';

async function getTodaysHoroscopes() {
  const response = await fetch(`${BASE_URL}/api/horoscopes/today`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.horoscopes;
}

async function getSignHoroscope(sign) {
  const response = await fetch(`${BASE_URL}/api/horoscopes/${sign}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data.horoscope;
}

// Usage
getTodaysHoroscopes()
  .then(horoscopes => console.log(`Retrieved ${horoscopes.length} horoscopes`))
  .catch(error => console.error('Error:', error));

getSignHoroscope('leo')
  .then(horoscope => console.log('Leo:', horoscope.content))
  .catch(error => console.error('Error:', error));
```

### Python

```python
import requests

API_KEY = 'amoeba_your_api_key_here'
BASE_URL = 'https://your-domain.replit.dev'

def get_todays_horoscopes():
    headers = {'Authorization': f'Bearer {API_KEY}'}
    response = requests.get(f'{BASE_URL}/api/horoscopes/today', headers=headers)
    response.raise_for_status()
    return response.json()['horoscopes']

def get_sign_horoscope(sign):
    headers = {'Authorization': f'Bearer {API_KEY}'}
    response = requests.get(f'{BASE_URL}/api/horoscopes/{sign}', headers=headers)
    response.raise_for_status()
    return response.json()['horoscope']

# Usage
try:
    horoscopes = get_todays_horoscopes()
    print(f"Retrieved {len(horoscopes)} horoscopes")
    
    leo_horoscope = get_sign_horoscope('leo')
    print(f"Leo: {leo_horoscope['content']}")
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### cURL

```bash
# Get all today's horoscopes
curl -X GET "https://your-domain.replit.dev/api/horoscopes/today" \
  -H "Authorization: Bearer amoeba_your_api_key_here"

# Get specific sign
curl -X GET "https://your-domain.replit.dev/api/horoscopes/leo" \
  -H "Authorization: Bearer amoeba_your_api_key_here"

# Trigger generation (requires session authentication)
curl -X POST "https://your-domain.replit.dev/api/cron/trigger-horoscopes" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=your_session_cookie" \
  -d '{"date": "2025-10-07"}'
```

---

## Best Practices

### 1. API Key Security

- **Never commit API keys to version control**
- Store API keys in environment variables or secure secret management systems
- Rotate API keys periodically (recommended: every 90 days)
- Use separate API keys for development and production
- Revoke compromised keys immediately through the dashboard

### 2. Caching

Horoscopes are generated once daily at midnight UTC. To optimize performance:

```javascript
// Cache horoscopes for 24 hours
const cache = new Map();

async function getCachedHoroscope(sign) {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${sign}-${today}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const horoscope = await getSignHoroscope(sign);
  cache.set(cacheKey, horoscope);
  
  return horoscope;
}
```

### 3. Error Handling

Always implement proper error handling:

```javascript
async function safeGetHoroscope(sign) {
  try {
    const horoscope = await getSignHoroscope(sign);
    return { success: true, data: horoscope };
  } catch (error) {
    console.error(`Failed to fetch horoscope for ${sign}:`, error);
    return { 
      success: false, 
      error: error.message,
      fallback: "Your horoscope is temporarily unavailable. Please try again later."
    };
  }
}
```

### 4. Rate Limiting

While there are no strict rate limits, please be respectful:

- **Recommended:** No more than 60 requests per minute
- **Bulk requests:** Use `/api/horoscopes/today` instead of individual requests
- **Caching:** Cache horoscopes for at least 1 hour to reduce load

### 5. Timezone Considerations

- All dates are in **UTC**
- Horoscopes are generated at **00:00 UTC** daily
- Convert timestamps to user's local timezone in your application

```javascript
// Get today's date in UTC
const todayUTC = new Date().toISOString().split('T')[0];
```

---

## Automatic Horoscope Generation

Amoeba automatically generates horoscopes on the following schedule:

| Task | Schedule | Time (UTC) |
|------|----------|-----------|
| Daily Horoscopes | Daily | 00:00 (Midnight) |
| Premium Emails | Daily | 06:00 (6:00 AM) |

**Generation Process:**
1. Astronomy service calculates planetary positions using **Swiss Ephemeris** (ultra-high precision)
2. Astrology data is cached for the target date
3. OpenAI GPT-5 generates personalized horoscopes for all 12 signs
4. Horoscopes are stored in PostgreSQL database
5. Webhook notifications are sent to registered endpoints

---

## Technical Details

### Astronomy Calculations

Amoeba uses **Swiss Ephemeris (WebAssembly)** for astronomical calculations, providing:

- **Precision:** 0.001 arcsecond accuracy
- **Planetary Positions:** Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- **Lunar Phases:** Accurate moon phase calculations
- **Aspects:** Planetary aspects and relationships
- **Zodiac Signs:** Precise zodiac sign boundaries

### AI-Generated Content

Horoscopes are generated using **OpenAI GPT-5** with:

- **Input:** Planetary positions, moon phase, zodiac sign characteristics
- **Output:** 150-200 word personalized horoscopes
- **Style:** Professional, engaging, specific to current astronomical conditions
- **Focus:** Love, career, health, and personal growth insights

### Database Storage

- **Database:** PostgreSQL (Neon serverless)
- **Table:** `horoscopes`
- **Indexes:** Optimized for date and zodiac sign queries
- **Retention:** Indefinite (historical horoscopes available)

---

## Support

### Documentation

- **Dashboard:** Access your API keys and settings
- **Logs:** View integration logs and webhook deliveries
- **Metrics:** Monitor API usage and performance

### Troubleshooting

**Problem:** "Invalid or expired API key"
- **Solution:** Generate a new API key from the dashboard

**Problem:** "Horoscope not found"
- **Solution:** Horoscopes are generated at midnight UTC. Check if generation has completed for the requested date.

**Problem:** Rate limit exceeded
- **Solution:** Implement caching and reduce request frequency

### Contact

For technical support or integration assistance:
- **Dashboard:** Settings → Support
- **Issues:** Report bugs through the issue tracking system

---

## Changelog

### Version 1.0 (October 2025)
- Initial API release
- Swiss Ephemeris integration for high-precision calculations
- GPT-5 powered horoscope generation
- API key authentication system
- Webhook support for real-time notifications
- Automatic daily generation at midnight UTC

---

## Legal

### Terms of Service

By using the Amoeba API, you agree to:
- Use horoscopes for lawful purposes only
- Properly attribute content when required
- Not abuse or circumvent rate limits
- Keep API keys secure and confidential

### Data Privacy

- API requests are logged for debugging and analytics
- No personal user data is collected through the API
- Horoscope content is publicly accessible with valid API key

---

**Last Updated:** October 6, 2025  
**API Version:** 1.0  
**Documentation Version:** 1.0.0
