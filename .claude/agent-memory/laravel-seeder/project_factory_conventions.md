---
name: Factory and Seeder Conventions
description: Laravel 13 factory/seeder patterns, User model attribute syntax, and seeder call order in this project
type: project
---

**Laravel version:** 13 (laravel/framework ^13.0, PHP ^8.3)

**Factory style:**
- Uses `fake()` helper (not `$this->faker`)
- Static cached password: `static::$password ??= Hash::make('password')`
- State methods return `static` and use closure-based `$this->state(fn (array $attributes) => [...])`
- Located at `database/factories/UserFactory.php`

**User model specifics:**
- Uses Laravel 13 PHP attribute syntax: `#[Fillable([...])]` and `#[Hidden([...])]` instead of `$fillable`/`$hidden` properties
- `role` field added as part of school management feature; valid values: `admin`, `teacher`, `student`
- `password` cast to `hashed` via `casts()` method — do NOT double-hash when using `firstOrCreate` with raw string; use `Hash::make()` explicitly since `firstOrCreate` bypasses the cast

**Seeder conventions:**
- `DatabaseSeeder` uses `WithoutModelEvents` trait
- Seeders wired via `$this->call([SeederClass::class])` array form
- Known-credential users created with `firstOrCreate(['email' => ...], [...])` for idempotency
- Random factory users created with `User::factory()->count(N)->state()->create()`

**Seeder call order in DatabaseSeeder (as of 2026-04-01):**
1. UserSeeder
