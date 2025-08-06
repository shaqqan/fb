# Personal API Documentation

## Overview
The Personal API provides comprehensive CRUD operations for managing personal records with advanced filtering, search, and pagination capabilities.

## Entity Structure

### Personal Record Fields
- **id**: Primary key (auto-generated)
- **fullName**: Multi-language name (JSONB format)
- **position**: Multi-language position/title (JSONB format)
- **information**: Additional information in multiple languages (JSONB format)
- **phone**: Phone number
- **email**: Email address
- **createdAt**: Auto-generated creation timestamp
- **updatedAt**: Auto-generated update timestamp

## API Endpoints

### 1. Create Personal Record
**POST** `/admin/personal`

**Request Body:**
```json
{
  "fullName": {
    "en": "John Doe",
    "uz": "Jon Do"
  },
  "position": {
    "en": "Manager",
    "uz": "Menejer"
  },
  "information": {
    "en": "Experienced manager with 10 years of experience",
    "uz": "10 yillik tajribaga ega menejer"
  },
  "phone": "+998901234567",
  "email": "john.doe@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "fullName": { "en": "John Doe", "uz": "Jon Do" },
  "position": { "en": "Manager", "uz": "Menejer" },
  "information": { "en": "Experienced manager...", "uz": "10 yillik..." },
  "phone": "+998901234567",
  "email": "john.doe@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 2. Get All Personal Records (Paginated)
**GET** `/admin/personal`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field and direction (e.g., `createdAt:DESC`)
- `search`: Global search term
- `filter.*`: Various filter options

**Example:**
```
GET /admin/personal?page=1&limit=10&sortBy=createdAt:DESC&search=manager
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "fullName": { "en": "John Doe", "uz": "Jon Do" },
      "position": { "en": "Manager", "uz": "Menejer" },
      "information": { "en": "Experienced...", "uz": "10 yillik..." },
      "phone": "+998901234567",
      "email": "john.doe@example.com",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "itemsPerPage": 10,
    "totalItems": 25,
    "currentPage": 1,
    "totalPages": 3,
    "sortBy": [["createdAt", "DESC"]],
    "searchBy": ["fullName", "position", "information", "phone", "email"],
    "search": "manager",
    "filter": {}
  },
  "links": {
    "first": "/admin/personal?page=1&limit=10",
    "previous": "",
    "current": "/admin/personal?page=1&limit=10",
    "next": "/admin/personal?page=2&limit=10",
    "last": "/admin/personal?page=3&limit=10"
  }
}
```

### 3. Get Personal Record by ID
**GET** `/admin/personal/:id`

**Example:**
```
GET /admin/personal/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "fullName": { "en": "John Doe", "uz": "Jon Do" },
  "position": { "en": "Manager", "uz": "Menejer" },
  "information": { "en": "Experienced...", "uz": "10 yillik..." },
  "phone": "+998901234567",
  "email": "john.doe@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 4. Update Personal Record
**PATCH** `/admin/personal/:id`

**Request Body:**
```json
{
  "position": {
    "en": "Senior Manager",
    "uz": "Katta Menejer"
  },
  "phone": "+998901234568"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "fullName": { "en": "John Doe", "uz": "Jon Do" },
  "position": { "en": "Senior Manager", "uz": "Katta Menejer" },
  "information": { "en": "Experienced...", "uz": "10 yillik..." },
  "phone": "+998901234568",
  "email": "john.doe@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T11:45:00Z"
}
```

### 5. Delete Personal Record
**DELETE** `/admin/personal/:id`

**Example:**
```
DELETE /admin/personal/1
```

**Response:** `200 OK`
```json
{
  "message": "Personal with ID 1 has been successfully deleted"
}
```

## Filtering Options

### Available Filters

1. **Phone Filter**
   ```
   GET /admin/personal?filter.phone=+99890
   ```

2. **Email Filter**
   ```
   GET /admin/personal?filter.email=@example.com
   ```

3. **Date Range Filters**
   ```
   GET /admin/personal?filter.createdAtStart=2024-01-01T00:00:00Z&filter.createdAtEnd=2024-12-31T23:59:59Z
   ```

### Combined Filters
```
GET /admin/personal?filter.phone=+99890&filter.createdAtStart=2024-01-01T00:00:00Z&search=manager
```

## Search Functionality

Global search across all text fields:
- `fullName` (multi-language)
- `position` (multi-language)
- `information` (multi-language)
- `phone`
- `email`

**Example:**
```
GET /admin/personal?search=manager
```

## Sorting Options

Available sort fields:
- `id`: Personal record ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Examples:**
```
GET /admin/personal?sortBy=createdAt:DESC
GET /admin/personal?sortBy=id:ASC
```

## Validation Rules

### CreatePersonalDto
- `fullName`: Required object (multi-language)
- `position`: Required object (multi-language)
- `information`: Optional object (multi-language)
- `phone`: Required string
- `email`: Required valid email format

### UpdatePersonalDto
- All fields are optional (partial updates supported)

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Personal with ID 999 not found",
  "error": "Not Found"
}
```

## Authentication

All endpoints require Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

## Multi-Language Support

The API supports multi-language content for:
- **fullName**: Person's name in different languages
- **position**: Job position/title in different languages
- **information**: Additional information in different languages

**Example multi-language structure:**
```json
{
  "fullName": {
    "en": "John Doe",
    "uz": "Jon Do",
    "ru": "Джон Доу"
  }
}
```

## Pagination Metadata

The paginated response includes:
- **itemsPerPage**: Number of items per page
- **totalItems**: Total number of items
- **currentPage**: Current page number
- **totalPages**: Total number of pages
- **sortBy**: Current sorting configuration
- **searchBy**: Fields being searched
- **search**: Current search term
- **filter**: Applied filters

## Usage Examples

### 1. Find All Managers
```
GET /admin/personal?search=manager&sortBy=createdAt:DESC
```

### 2. Find Personal Records Created This Month
```
GET /admin/personal?filter.createdAtStart=2024-01-01T00:00:00Z&filter.createdAtEnd=2024-01-31T23:59:59Z
```

### 3. Find by Phone Number
```
GET /admin/personal?filter.phone=+99890
```

### 4. Complex Search with Pagination
```
GET /admin/personal?page=2&limit=5&search=manager&filter.createdAtStart=2024-01-01T00:00:00Z&sortBy=createdAt:DESC
``` 