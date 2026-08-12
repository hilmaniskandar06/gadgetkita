-- ============================================================
-- GadgetKita — pg_cron Setup (Auto-cancel pesanan > 24 jam)
-- JALANKAN FILE INI TERPISAH di SQL Editor Supabase
-- SETELAH SUPABASE_GADGETKITA_SETUP.sql berhasil dijalankan
-- ============================================================

-- STEP 1: Enable pg_cron
-- Jalankan blok ini dulu, klik RUN, tunggu sukses
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT EXECUTE ON FUNCTION cron.schedule(text, text, text) TO postgres;
GRANT EXECUTE ON FUNCTION cron.unschedule(bigint) TO postgres;

-- ============================================================
-- STEP 2: Buat function cancel_expired_unpaid_orders
-- Paste blok ini ke query baru, klik RUN

CREATE OR REPLACE FUNCTION public.cancel_expired_unpaid_orders()
RETURNS void AS $$
DECLARE
  r_order RECORD;
  v_voucher_code TEXT;
  v_voucher_id TEXT;
  r_item RECORD;
BEGIN
  FOR r_order IN
    SELECT id, customer_info, items
    FROM public.orders
    WHERE status = 'belum_dibayar'
      AND created_at < NOW() - INTERVAL '24 hours'
    FOR UPDATE SKIP LOCKED
  LOOP
    -- 1. Cancel order
    UPDATE public.orders
    SET
      status = 'dibatalkan',
      payment_status = 'dibatalkan',
      customer_info = COALESCE(r_order.customer_info, '{}'::jsonb) ||
        jsonb_build_object('cancelReason', 'Timeout 24 jam tidak upload bukti transfer (otomatis oleh sistem)')
    WHERE id = r_order.id;

    -- 2. Rollback voucher (voucherCode ada di dalam customer_info JSONB)
    v_voucher_code := r_order.customer_info->>'voucherCode';
    IF v_voucher_code IS NOT NULL AND v_voucher_code <> '' THEN
      SELECT id INTO v_voucher_id
      FROM public.vouchers
      WHERE code = v_voucher_code
      LIMIT 1;
      IF FOUND THEN
        UPDATE public.vouchers
        SET used = GREATEST(0, COALESCE(used, 0) - 1)
        WHERE id = v_voucher_id;
      END IF;
    END IF;

    -- 3. Rollback product sold count
    IF r_order.items IS NOT NULL AND jsonb_array_length(r_order.items) > 0 THEN
      FOR r_item IN
        SELECT
          (elem->>'id')::text AS product_id,
          COALESCE(NULLIF((elem->>'qty')::text, '')::int, 1) AS qty
        FROM jsonb_array_elements(r_order.items) AS elem
      LOOP
        IF r_item.product_id IS NOT NULL THEN
          UPDATE public.products
          SET sold = GREATEST(0, COALESCE(sold, 0) - r_item.qty)
          WHERE id = r_item.product_id;
        END IF;
      END LOOP;
    END IF;

  END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;

ALTER FUNCTION public.cancel_expired_unpaid_orders() OWNER TO postgres;

-- ============================================================
-- STEP 3: Jadwalkan cron setiap 10 menit
-- Paste blok ini ke query baru, klik RUN

SELECT cron.schedule(
  'cancel-expired-unpaid-orders',
  '*/10 * * * *',
  'SELECT public.cancel_expired_unpaid_orders()'
);

-- Cek apakah cron sudah aktif:
-- SELECT * FROM cron.job;

