## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `phone` | `text` |  Nullable |
| `avatar` | `text` |  Nullable |
| `address` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `carts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `items` | `jsonb` |  |
| `updated_at` | `timestamptz` |  Nullable |

## Table `wishlists`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `user_id` | `uuid` | Primary |
| `items` | `jsonb` |  |
| `updated_at` | `timestamptz` |  Nullable |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `user_id` | `uuid` |  Nullable |
| `status` | `text` |  |
| `payment_status` | `text` |  Nullable |
| `total` | `numeric` |  |
| `items` | `jsonb` |  |
| `customer_info` | `jsonb` |  |
| `tracking_number` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `name` | `text` |  |
| `price` | `numeric` |  |
| `old_price` | `numeric` |  Nullable |
| `category` | `text` |  Nullable |
| `weight` | `text` |  Nullable |
| `in_stock` | `bool` |  Nullable |
| `content_volume` | `text` |  Nullable |
| `is_new` | `bool` |  Nullable |
| `short_desc` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `images` | `_text` |  Nullable |
| `external_link` | `text` |  Nullable |
| `sold` | `int4` |  |
| `size` | `text` |  Nullable |
| `gender` | `text` |  Nullable |
| `sport_type` | `text` |  Nullable |
| `material` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `name` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `color` | `text` |  Nullable |
| `text_color` | `text` |  Nullable |

## Table `payments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `type` | `text` |  |
| `name` | `text` |  |
| `account` | `text` |  |
| `account_name` | `text` |  Nullable |
| `logo` | `text` |  Nullable |
| `qr` | `text` |  Nullable |

## Table `vouchers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `code` | `text` |  Unique |
| `type` | `text` |  |
| `value` | `numeric` |  |
| `min_order` | `numeric` |  Nullable |
| `max_discount` | `numeric` |  Nullable |
| `expiry_date` | `date` |  Nullable |
| `usage_limit` | `int4` |  Nullable |
| `used` | `int4` |  |

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `user_id` | `text` |  |
| `title` | `text` |  |
| `message` | `text` |  |
| `link` | `text` |  Nullable |
| `is_read` | `bool` |  Nullable |
| `read_by` | `_text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `chats`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `user_id` | `uuid` |  Nullable |
| `user_name` | `text` |  Nullable |
| `last_updated` | `timestamptz` |  Nullable |
| `messages` | `jsonb` |  |

## Table `site_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `data` | `jsonb` |  |

## RLS Policies

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Insert profile on signup` | INSERT | public | PERMISSIVE | — | `(auth.uid() = id)` |
| `Users can update own profile` | UPDATE | public | PERMISSIVE | `(auth.uid() = id)` | — |
| `Users can view own profile` | SELECT | public | PERMISSIVE | `(auth.uid() = id)` | — |

### `carts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Own cart access` | ALL | public | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `wishlists`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Own wishlist access` | ALL | public | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `orders`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Update order own or admin` | UPDATE | public | PERMISSIVE | `((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) ~~ '%@admin%'::text) OR ((auth.jwt() ->> 'email'::text) ~~ '%@sportkita%'::text))` | — |
| `Insert order auth or anon` | INSERT | public | PERMISSIVE | — | `true` |
| `Read own orders` | SELECT | public | PERMISSIVE | `((auth.uid() = user_id) OR ((auth.jwt() ->> 'email'::text) ~~ '%@admin%'::text) OR ((auth.jwt() ->> 'email'::text) ~~ '%@sportkita%'::text))` | — |

### `products`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated can delete products` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `Authenticated can update products` | UPDATE | authenticated | PERMISSIVE | `true` | — |
| `Authenticated can insert products` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Read products publicly` | SELECT | public | PERMISSIVE | `true` | — |

### `categories`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated can delete categories` | DELETE | authenticated | PERMISSIVE | `true` | — |
| `Authenticated can update categories` | UPDATE | authenticated | PERMISSIVE | `true` | — |
| `Authenticated can insert categories` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Read categories publicly` | SELECT | public | PERMISSIVE | `true` | — |

### `payments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Read payments publicly` | SELECT | public | PERMISSIVE | `true` | — |

### `vouchers`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Read vouchers publicly` | SELECT | public | PERMISSIVE | `true` | — |

### `notifications`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated insert notifications` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Own notifications mark read` | UPDATE | public | PERMISSIVE | `((user_id = (auth.uid())::text) OR (user_id = 'ALL'::text))` | — |
| `Own notifications read` | SELECT | public | PERMISSIVE | `((user_id = (auth.uid())::text) OR (user_id = 'ALL'::text))` | — |

### `chats`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Own chats` | ALL | public | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `site_settings`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `Authenticated can insert site_settings` | INSERT | authenticated | PERMISSIVE | — | `true` |
| `Read site_settings publicly` | SELECT | public | PERMISSIVE | `true` | — |
| `Authenticated can update site_settings` | UPDATE | authenticated | PERMISSIVE | `true` | — |

