# Creato — Supabase Database Schema (Draft v1)

> Энэ бол Phase 1-д migration болгох суурь дизайн. Бүх хүснэгтэд RLS асаана.
> Зарчим: prompt/model/cost-той холбоотой бүх багана **server-only** — client рүү view/whitelist-ээр л гарна.

## ER тойм

```
profiles ──1:1── wallets ──1:N── wallet_transactions
profiles ──1:N── generations ──N:1── presets ──N:1── categories
presets ──1:N── preset_fields
homepage_sections (CMS)
credit_packages ──1:N── payments
admin_audit_logs
```

## Хүснэгтүүд

### profiles
| Багана | Төрөл | Тайлбар |
|---|---|---|
| id | uuid PK (= auth.users.id) | |
| email | text | |
| display_name | text | |
| role | text default 'user' | 'user' / 'admin' |
| trial_granted | boolean default false | |
| created_at / updated_at | timestamptz | |

### wallets
| id uuid PK | user_id uuid unique FK profiles | balance int default 0 (credit, бүхэл) | updated_at |

> Баланс өөрчлөлт зөвхөн RPC-ээр (reserve/spend/refund/adjust) — шууд UPDATE хориглоно.

### wallet_transactions
| Багана | Төрөл | Тайлбар |
|---|---|---|
| id | uuid PK | |
| wallet_id | uuid FK | |
| amount | int | +/- credit |
| type | text | trial · purchase · reserve · spend · refund · failed_generation_refund · compensation · manual_topup · bonus · correction · creator_reward(future) · other |
| status | text | pending · completed · cancelled |
| generation_id | uuid null | холбоотой бол |
| payment_id | uuid null | |
| admin_id | uuid null | гар тохиргоо бол |
| reason | text null | admin adjustment-д заавал |
| note | text null | admin adjustment-д заавал |
| created_at | timestamptz | |

### categories
| id uuid PK | name text | slug text unique | sort_order int | is_active bool | created_at |

### presets
**Client-д харагдах (public) баганууд:**
| id | slug unique | category_id FK | name | short_description | full_description | user_guide | thumbnail_url | example_image_urls text[] | credit_cost int | status ('draft'/'active'/'hidden') | sort_order | is_featured | is_trending | is_popular | is_new | requires_image bool | min_image_count | max_image_count | allowed_file_types text[] | max_file_size_mb | upload_guide_text | upload_example_url | allowed_sizes text[] ('1:1','4:5','9:16','16:9','3:4') | output_count int |

**Server-only баганууд (client-д ХЭЗЭЭ Ч гарахгүй):**
| base_prompt | negative_prompt | prompt_suffix | quality_prompt | cleanup_prompt | internal_note | prompt_version int | primary_provider ('gemini'/'openai') | primary_model | fallback_provider | fallback_model | quality_preset ('standard'/'high'/'premium') | retry_limit int | cleanup_enabled bool | estimated_cost numeric | credit_auto_calculated int | credit_override bool | credit_override_reason |

> **preset_public view:** зөвхөн public багануудыг сонгосон view; anon/authenticated зөвхөн энэ view-ээс status='active' уншина. Base table-д client ролиудад SELECT эрх байхгүй.

### preset_fields
| Багана | Тайлбар |
|---|---|
| id, preset_id FK | |
| field_key | prompt доторх [variable]-тай таарна |
| label, input_type ('text','textarea','select','radio','checkbox','color','number','image','aspect_ratio') | |
| required bool, placeholder, help_text, default_value | |
| choices jsonb | select/radio-д |
| prompt_mapping | **server-only** |
| sort_order, is_active | |

> Client view: prompt_mapping-гүй баганууд л гарна.

### generations
| Багана | Тайлбар |
|---|---|
| id, user_id, preset_id | |
| status | 'processing' · 'completed' · 'failed' |
| user_inputs jsonb | хэрэглэгчийн бөглөсөн утгууд (sensitive биш) |
| input_image_paths text[] | uploads bucket |
| output_paths text[] | outputs bucket |
| selected_size, output_count | |
| credit_cost int, transaction_id | |
| compiled_prompt | **server-only** (client SELECT-д гарахгүй) |
| provider_used, model_used, attempt_count, error_message | **server-only** |
| created_at, completed_at | |

### homepage_sections
| section_key text unique | section_type ('hero','benefit_strip','featured_presets','how_it_works','showcase','creator_community','business_use_cases','final_cta','faq','custom_content') | title | subtitle | is_visible bool | sort_order | layout_variant | background_variant | cta_label | cta_url | content_source jsonb | metadata jsonb | publish_at timestamptz null |

### credit_packages
| id | name | credits int | price_mnt int | is_org bool | sort_order | is_active |

### payments
| id | user_id | package_id | amount_mnt | provider ('bonum') | provider_invoice_id | status ('pending','paid','failed','cancelled') | fee_mnt default 0 | created_at, paid_at |

### admin_audit_logs
| id | admin_id | action | target_table | target_id | payload jsonb | created_at |

## RPC функцууд (SECURITY DEFINER)

```sql
reserve_credits(p_user uuid, p_amount int, p_generation uuid) -- баланс шалгаад reserve бичнэ, хүрэлцэхгүй бол exception
spend_credits(p_generation uuid)    -- reserved → spent
refund_credits(p_generation uuid)   -- reserved → refunded (failed_generation_refund)
admin_adjust_credits(p_user uuid, p_amount int, p_type text, p_reason text, p_note text) -- type/reason/note заавал, audit log давхар бичнэ
```

> Бүгд row-level lock (SELECT ... FOR UPDATE) ашиглаж race condition-оос сэргийлнэ.

## Trigger

- `handle_new_user`: auth.users INSERT → profiles + wallets + 1 trial credit (trial transaction).
- `updated_at` auto-touch triggers.

## Storage buckets

| Bucket | Хандалт |
|---|---|
| public-assets | public read (thumbnail, example, CMS зураг) |
| uploads | private; эзэмшигч + service role |
| outputs | private; эзэмшигч signed URL-ээр татна |

## RLS товч матриц

| Хүснэгт | anon | user | admin |
|---|---|---|---|
| preset_public (view) | active read | active read | — (admin base table уншина) |
| presets (base) | ✗ | ✗ | full |
| preset_fields public view | active read | active read | full (base) |
| profiles | ✗ | own | full |
| wallets / wallet_transactions | ✗ | own read | full |
| generations | ✗ | own (server-only багана хасагдсан view-ээр) | full |
| homepage_sections | visible read | visible read | full |
| credit_packages | active read | active read | full |
| payments | ✗ | own read | full |
| admin_audit_logs | ✗ | ✗ | read (insert зөвхөн RPC) |
