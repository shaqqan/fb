# Match Schedule Filtering Documentation

## Overview
The Match Schedule API now supports comprehensive filtering capabilities to help you find specific matches based on various criteria including leagues, sub-leagues, stadiums, status, and date ranges.

## Available Filters

### 1. League Filters
- **`filter.clubLeagueId`**: Filter matches by the club's league ID
- **`filter.opponentLeagueId`**: Filter matches by the opponent's league ID  
- **`filter.leagueId`**: Filter matches where either club or opponent belongs to the specified league

**Example:**
```
GET /admin/match-schedule?filter.leagueId=1
GET /admin/match-schedule?filter.clubLeagueId=2&filter.opponentLeagueId=3
```

### 2. Sub-League Filters
- **`filter.clubSubLeagueId`**: Filter matches by the club's sub-league ID
- **`filter.opponentSubLeagueId`**: Filter matches by the opponent's sub-league ID
- **`filter.subLeagueId`**: Filter matches where either club or opponent belongs to the specified sub-league

**Example:**
```
GET /admin/match-schedule?filter.subLeagueId=5
GET /admin/match-schedule?filter.clubSubLeagueId=4
```

### 3. Stadium Filter
- **`filter.stadiumId`**: Filter matches by stadium ID

**Example:**
```
GET /admin/match-schedule?filter.stadiumId=10
```

### 4. Status Filter
- **`filter.status`**: Filter matches by status
  - `pending`: Matches that haven't started
  - `in_progress`: Matches currently being played
  - `completed`: Finished matches
  - `cancelled`: Cancelled matches

**Example:**
```
GET /admin/match-schedule?filter.status=completed
GET /admin/match-schedule?filter.status=pending
```

### 5. Date Range Filters

#### Creation Date Range
- **`filter.createdAtStart`**: Filter matches created after this date (ISO format)
- **`filter.createdAtEnd`**: Filter matches created before this date (ISO format)

#### Match Date Range
- **`filter.matchDateStart`**: Filter matches scheduled after this date (ISO format)
- **`filter.matchDateEnd`**: Filter matches scheduled before this date (ISO format)

**Example:**
```
GET /admin/match-schedule?filter.matchDateStart=2024-01-01T00:00:00Z&filter.matchDateEnd=2024-12-31T23:59:59Z
GET /admin/match-schedule?filter.createdAtStart=2024-01-01T00:00:00Z
```

### 6. Club Filters
- **`filter.clubId`**: Filter matches by club ID
- **`filter.opponentClubId`**: Filter matches by opponent club ID

**Example:**
```
GET /admin/match-schedule?filter.clubId=15
GET /admin/match-schedule?filter.opponentClubId=20
```

## Combined Filtering Examples

### 1. Upcoming Matches in a Specific League
```
GET /admin/match-schedule?filter.leagueId=1&filter.status=pending&filter.matchDateStart=2024-01-01T00:00:00Z
```

### 2. Completed Matches in a Specific Stadium
```
GET /admin/match-schedule?filter.stadiumId=5&filter.status=completed
```

### 3. Matches Between Specific Clubs
```
GET /admin/match-schedule?filter.clubId=10&filter.opponentClubId=15
```

### 4. Matches in Date Range with Status
```
GET /admin/match-schedule?filter.matchDateStart=2024-01-01T00:00:00Z&filter.matchDateEnd=2024-01-31T23:59:59Z&filter.status=completed
```

### 5. Complex League and Sub-League Filtering
```
GET /admin/match-schedule?filter.leagueId=1&filter.subLeagueId=3&filter.status=pending
```

## Sorting Options

The API supports sorting by:
- `id`: Match ID
- `matchDate`: Match date and time
- `status`: Match status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Example:**
```
GET /admin/match-schedule?sortBy=matchDate:ASC&filter.status=pending
```

## Search Functionality

Global search across:
- `club.name`: Club names
- `opponentClub.name`: Opponent club names
- `stadium.name`: Stadium names

**Example:**
```
GET /admin/match-schedule?search=Manchester
```

## Pagination

- **`page`**: Page number (default: 1)
- **`limit`**: Items per page (default: 10, max: 100)

**Example:**
```
GET /admin/match-schedule?page=2&limit=20&filter.status=completed
```

## Complete Example

```
GET /admin/match-schedule?page=1&limit=15&sortBy=matchDate:ASC&filter.leagueId=1&filter.status=pending&filter.matchDateStart=2024-01-01T00:00:00Z&search=United
```

This request will:
- Get page 1 with 15 items per page
- Sort by match date (ascending)
- Filter by league ID 1
- Filter by pending status
- Filter matches after January 1, 2024
- Search for "United" in club names, opponent names, or stadium names

## Response Format

The API returns a paginated response with:
- `data`: Array of match objects
- `meta`: Pagination metadata
- `links`: Navigation links

Each match object includes:
- Basic match information (scores, dates, status)
- Club details (name, logo)
- League and sub-league information
- Stadium details (name, address, city) 