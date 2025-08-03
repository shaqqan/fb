# Football Board API Documentation

## Swagger/OpenAPI Documentation

Your Football Board API now includes comprehensive Swagger/OpenAPI documentation!

### Access the Documentation

Once you start the server, you can access the interactive API documentation at:

**Local Development:**
```
http://localhost:3002/api/docs
```

**Production:**
```
https://your-domain.com/api/docs
```

### API Base URL

All API endpoints are prefixed with `/api/v1/`:

- **Authentication:** `http://localhost:3002/api/v1/auth/`
- **News:** `http://localhost:3002/api/v1/news/`
- **Staff:** `http://localhost:3002/api/v1/staff/`
- **Partners:** `http://localhost:3002/api/v1/partner/`
- **File Upload:** `http://localhost:3002/api/v1/upload/`

### Features

✅ **Complete API Documentation** - All endpoints documented with descriptions, examples, and schemas
✅ **Interactive Testing** - Test API endpoints directly from the documentation
✅ **Authentication Support** - JWT Bearer token authentication integrated
✅ **Request/Response Examples** - Clear examples for all data structures
✅ **Multi-language Support** - Documented support for multiple languages (RU, EN, QQ, KK, UZ, OZ)
✅ **File Upload Documentation** - Complete file upload specifications

### Authentication

1. **Sign up or sign in** using the `/auth/signin` or `/auth/signup` endpoints
2. Copy the `access_token` from the response
3. Click the **"Authorize"** button in Swagger UI
4. Enter `Bearer YOUR_ACCESS_TOKEN` in the authorization field
5. You can now test protected endpoints!

### API Sections

#### 🔐 Authentication (`/auth`)
- **POST** `/signup` - Register a new user
- **POST** `/signin` - Sign in user  
- **POST** `/logout` - Logout user
- **POST** `/refresh` - Refresh access token

#### 📰 News Management (`/news`)
- **GET** `/` - Get all news articles *(Paginated)*
- **GET** `/latest` - Get latest 5 news articles
- **GET** `/:id` - Get news article by ID
- **POST** `/` - Create new news article *(Auth Required)*
- **PATCH** `/:id` - Update news article *(Auth Required)*
- **DELETE** `/:id` - Delete news article *(Auth Required)*

#### 👥 Staff Management (`/staff`)
- **GET** `/` - Get all staff members *(Paginated)*
- **GET** `/:id` - Get staff member by ID
- **POST** `/` - Create new staff member *(Auth Required)*
- **PATCH** `/:id` - Update staff member *(Auth Required)*
- **DELETE** `/:id` - Delete staff member *(Auth Required)*

#### 🤝 Partner Management (`/partner`)
- **GET** `/` - Get all partners *(Paginated)*
- **GET** `/:id` - Get partner by ID
- **POST** `/` - Create new partner *(Auth Required)*
- **PATCH** `/:id` - Update partner *(Auth Required)*
- **DELETE** `/:id` - Delete partner *(Auth Required)*

#### 🏆 League Management (`/leagues`)
- **GET** `/` - Get all leagues *(Paginated)*
- **GET** `/roots` - Get root leagues (top-level leagues without parents) *(Paginated)*
- **GET** `/:id` - Get league by ID
- **GET** `/:id/children` - Get child leagues of a specific league
- **GET** `/:id/parent` - Get parent league of a specific league
- **GET** `/:id/hierarchy` - Get league with full hierarchy (parent & children)
- **POST** `/` - Create new league *(Auth Required)*
- **PATCH** `/:id` - Update league *(Auth Required)*
- **DELETE** `/:id` - Delete league *(Auth Required)*

#### 🔗 Club-SubLeague Relationships (`/club-sub-league`)
- **POST** `/` - Link club to sub-league *(Auth Required)*
- **GET** `/` - Get all relationships *(Paginated)*
- **GET** `/club/:clubId` - Get sub-leagues for club
- **GET** `/sub-league/:subLeagueId` - Get clubs for sub-league
- **GET** `/:clubId/:subLeagueId` - Get specific relationship
- **PATCH** `/:clubId/:subLeagueId` - Update relationship *(Auth Required)*
- **DELETE** `/:clubId/:subLeagueId` - Unlink club from sub-league *(Auth Required)*

#### 📁 File Upload (`/upload`)
- **POST** `/` - Upload files (images) *(Auth Required)*

### Pagination

All list endpoints (News, Staff, Partners, Leagues, Club-SubLeague relationships) now support advanced pagination, sorting, filtering, and searching powered by `nestjs-paginate`.

#### Pagination Parameters

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort by field(s). Format: `field:ASC` or `field:DESC`
- `search` - Global search across searchable fields
- `filter.field` - Filter by specific field values

#### Example Pagination Requests

**Basic pagination:**
```
GET /api/v1/news?page=1&limit=10
```

**Sorting (single field):**
```
GET /api/v1/news?sortBy=createdAt:DESC
```

**Multiple sorting:**
```
GET /api/v1/news?sortBy=status:ASC&sortBy=createdAt:DESC
```

**Search across fields:**
```
GET /api/v1/news?search=football
GET /api/v1/staff?search=john
GET /api/v1/leagues?search=premier
```

**Filtering:**
```
GET /api/v1/news?filter.status=PUBLISHED
GET /api/v1/staff?filter.status=ACTIVE
GET /api/v1/leagues?filter.parentLeagueId=1
GET /api/v1/club-sub-league?filter.clubId=1
GET /api/v1/club-sub-league?filter.subLeagueId=2
```

**Combined example:**
```
GET /api/v1/news?page=2&limit=5&sortBy=createdAt:DESC&search=championship&filter.status=PUBLISHED
```

#### Available Sort Fields

**News:**
- `id`, `createdAt`, `updatedAt`, `publishedAt`, `status`

**Staff:**
- `id`, `fullname`, `position`, `status`, `createdAt`

**Partners:**
- `id`, `name`, `status`, `createdAt`

**Leagues:**
- `id`, `createdAt`, `updatedAt`

**Club-SubLeague Relationships:**
- `clubId`, `subLeagueId`

#### Available Search Fields

**News:**
- `title`, `description` (searches in multi-language content)

**Staff:**
- `fullname`, `position`, `email`

**Partners:**
- `name`, `email`

**Leagues:**
- `title` (searches in multi-language content)

**Club-SubLeague Relationships:**
- No searchable fields (junction table with only IDs)

#### Available Filter Fields

**News:**
- `status` (DRAFT, PUBLISHED, ARCHIVED, DELETED, PENDING)
- `authorId` (numeric user ID)

**Staff:**
- `status` (ACTIVE, NOACTIVE)
- `position` (text match)

**Partners:**
- `status` (ACTIVE, NOACTIVE)

**Leagues:**
- `parentLeagueId` (filter by parent league ID)

**Club-SubLeague Relationships:**
- `clubId` (filter by specific club)
- `subLeagueId` (filter by specific sub-league)

#### Pagination Response Format

All paginated endpoints return responses in this format:

```json
{
  "data": [
    // Array of items
  ],
  "meta": {
    "itemsPerPage": 10,
    "totalItems": 45,
    "currentPage": 1,
    "totalPages": 5,
    "sortBy": [["createdAt", "DESC"]],
    "searchBy": ["title", "description"],
    "search": "football",
    "filter": {
      "status": "PUBLISHED"
    }
  },
  "links": {
    "first": "http://localhost:3002/api/v1/news?page=1&limit=10",
    "previous": null,
    "current": "http://localhost:3002/api/v1/news?page=1&limit=10",
    "next": "http://localhost:3002/api/v1/news?page=2&limit=10",
    "last": "http://localhost:3002/api/v1/news?page=5&limit=10"
  }
}
```

### Data Structures

#### Multi-Language Content
All content (news titles/descriptions, partner descriptions, staff information) supports multiple languages:

```json
{
  "ru": "Содержание на русском языке",
  "en": "Content in English", 
  "qq": "Qaraqalpaq tilinde mazmuni",
  "kk": "Қазақ тіліндегі мазмұн",
  "uz": "O'zbek tilidagi kontent",
  "oz": "Ўзбек тилидаги контент"
}
```

#### User Roles
- **ADMIN** - Full access to all operations
- **MODER** - Limited access (check specific endpoints)

#### Status Types
- **News:** `DRAFT`, `PUBLISHED`, `ARCHIVED`, `DELETED`, `PENDING`
- **Staff:** `ACTIVE`, `NOACTIVE`  
- **Partners:** `ACTIVE`, `NOACTIVE`

### Getting Started

1. **Start the server:**
   ```bash
   npm run start:dev
   ```

2. **Open your browser and go to:**
   ```
   http://localhost:3002/api/docs
   ```

3. **Create an admin user** (if needed):
   ```bash
   npm run seed
   ```
   Default admin credentials: `admin@example.com` / `admin123`

4. **Sign in and get your token** via the `/auth/signin` endpoint

5. **Authorize in Swagger** and start testing the API!

### File Upload Notes

- **Supported formats:** JPG, JPEG, PNG, GIF, WEBP
- **Maximum file size:** 5MB
- **Upload endpoint:** `POST /api/v1/upload`
- **Returns:** `{ filename: "generated-name.jpg", path: "/uploads/generated-name.jpg" }`

### 🏗️ Hierarchical League Management

The League system now supports hierarchical organization where leagues can have parent-child relationships, creating a tree structure for organizing competitions.

#### 🔗 **Key Features:**

- **Parent-Child Relationships** - Leagues can have parent and child leagues
- **Root Leagues** - Top-level leagues without parents
- **Circular Reference Prevention** - System prevents infinite loops in hierarchy
- **Cascade Protection** - Cannot delete leagues with child leagues or clubs
- **Full Hierarchy Queries** - Get complete league trees in single requests

#### 📋 **Hierarchical Endpoints:**

**Get Root Leagues (Top Level):**
```bash
GET /api/v1/leagues/roots
# Returns only leagues that have no parent (top-level leagues)
```

**Get Child Leagues:**
```bash
GET /api/v1/leagues/1/children
# Returns all direct child leagues of league #1
```

**Get Parent League:**
```bash
GET /api/v1/leagues/5/parent
# Returns the parent league of league #5 (or null if it's a root league)
```

**Get Full Hierarchy:**
```bash
GET /api/v1/leagues/3/hierarchy
# Returns league #3 with full context: parent, children, grand-children (3 levels deep)
```

**Filter by Parent:**
```bash
GET /api/v1/leagues?filter.parentLeagueId=1
# Get all leagues that are children of league #1
```

#### 🏗️ **Creating Hierarchical Leagues:**

**Create Root League:**
```json
POST /api/v1/leagues
Authorization: Bearer YOUR_JWT_TOKEN
{
  "title": {
    "en": "UEFA Competitions",
    "ru": "Соревнования УЕФА"
  },
  "logo": "/uploads/uefa-logo.png"
  // No parentLeagueId = Root league
}
```

**Create Child League:**
```json
POST /api/v1/leagues
Authorization: Bearer YOUR_JWT_TOKEN
{
  "title": {
    "en": "Champions League",
    "ru": "Лига чемпионов"
  },
  "logo": "/uploads/ucl-logo.png",
  "parentLeagueId": 1  // Child of UEFA Competitions
}
```

#### ⚙️ **Hierarchy Management:**

**Move League to Different Parent:**
```json
PATCH /api/v1/leagues/5
Authorization: Bearer YOUR_JWT_TOKEN
{
  "parentLeagueId": 3  // Move league #5 under league #3
}
```

**Make League a Root League:**
```json
PATCH /api/v1/leagues/5
Authorization: Bearer YOUR_JWT_TOKEN
{
  "parentLeagueId": null  // Remove parent, make it a root league
}
```

#### 🛡️ **Smart Validations:**

1. **Circular Reference Prevention:**
   - Cannot set a league's descendant as its parent
   - System checks the entire hierarchy tree
   - Clear error messages for invalid operations

2. **Deletion Protection:**
   - Cannot delete leagues with child leagues
   - Cannot delete leagues with clubs
   - Must reassign or remove dependencies first

3. **Parent Validation:**
   - Parent league must exist before assignment
   - Clear error messages for non-existent parents

#### 📊 **Example Hierarchy Structure:**

```
UEFA Competitions (Root)
├── Champions League
│   ├── Group Stage
│   └── Knockout Stage
├── Europa League
│   ├── Group Stage
│   └── Knockout Stage
└── Conference League
    ├── Group Stage
    └── Knockout Stage

FIFA Competitions (Root)
├── World Cup
├── Club World Cup
└── Confederations Cup
```

#### 🔍 **Query Examples:**

**Get all UEFA competitions:**
```bash
GET /api/v1/leagues?filter.parentLeagueId=1
```

**Get all top-level competitions:**
```bash
GET /api/v1/leagues/roots
```

**Get Champions League with all its stages:**
```bash
GET /api/v1/leagues/2/children
```

**Get complete UEFA hierarchy:**
```bash
GET /api/v1/leagues/1/hierarchy
```

#### 💡 **Use Cases:**

1. **Sports Organization Structure** - Model real-world competition hierarchies
2. **Tournament Management** - Organize competitions by levels and divisions
3. **Navigation Systems** - Build hierarchical menus and breadcrumbs
4. **Reporting** - Generate reports by competition level or organization
5. **Access Control** - Implement permissions based on league hierarchy

### Environment Configuration

Make sure your `.env` file includes:
```env
PORT=3002
CORS_ORIGIN=*
AT_SECRET=your-access-token-secret
RT_SECRET=your-refresh-token-secret
```

---

🎉 **Your API is now fully documented and ready to use!**

For any issues or questions, refer to the interactive documentation at `/api/docs`.