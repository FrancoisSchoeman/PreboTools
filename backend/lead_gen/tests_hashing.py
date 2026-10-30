from django.test import SimpleTestCase

from lead_gen.utils.hashing import hash_phone_ec, normalize_phone_e164, sha256_hash


class NormalizePhoneE164Tests(SimpleTestCase):
    def test_us_parentheses_alaska(self):
        self.assertEqual(
            normalize_phone_e164("(907) 617-6352", "US"),
            "+19076176352",
        )

    def test_us_common_formats(self):
        expected = "+19076176352"
        for raw in (
            "907-617-6352",
            "907.617.6352",
            "907 617 6352",
            "+1 907 617 6352",
            "+1 (907) 617-6352",
            "19076176352",
            "1-907-617-6352",
        ):
            self.assertEqual(
                normalize_phone_e164(raw, "US"),
                expected,
                msg=raw,
            )

    def test_us_area_code_styles(self):
        cases = {
            "(360) 555-1234": "+13605551234",
            "(207) 555-1234": "+12075551234",
            "(302) 555-1234": "+13025551234",
        }
        for raw, expected in cases.items():
            self.assertEqual(normalize_phone_e164(raw, "US"), expected, msg=raw)

    def test_ca_same_nanp_path(self):
        self.assertEqual(
            normalize_phone_e164("(416) 555-1234", "CA"),
            "+14165551234",
        )

    def test_extension_stripped(self):
        self.assertEqual(
            normalize_phone_e164("(907) 617-6352 ext. 12", "US"),
            "+19076176352",
        )
        self.assertEqual(
            normalize_phone_e164("(907) 617-6352 x123", "US"),
            "+19076176352",
        )
        self.assertEqual(
            normalize_phone_e164("(907) 617-6352#99", "US"),
            "+19076176352",
        )

    def test_idd_prefix_00(self):
        self.assertEqual(
            normalize_phone_e164("0019076176352", "US"),
            "+19076176352",
        )

    def test_za_mobile_leading_zero(self):
        self.assertEqual(
            normalize_phone_e164("082 123 4567", "ZA"),
            "+27821234567",
        )

    def test_za_already_international(self):
        self.assertEqual(
            normalize_phone_e164("+27 82 123 4567", "ZA"),
            "+27821234567",
        )

    def test_us_number_with_za_country_wrong_but_valid_e164(self):
        # Misconfigured country: national US digits get ZA dial prepended.
        self.assertEqual(
            normalize_phone_e164("(907) 617-6352", "ZA"),
            "+279076176352",
        )

    def test_invalid_too_short(self):
        self.assertEqual(normalize_phone_e164("123", "US"), "")
        self.assertEqual(normalize_phone_e164("(907) 617", "US"), "")

    def test_nanp_invalid_leading_digit(self):
        # Area codes cannot start with 0 or 1.
        self.assertEqual(normalize_phone_e164("0176176352", "US"), "")
        self.assertEqual(normalize_phone_e164("1176176352", "US"), "")

    def test_empty(self):
        self.assertEqual(normalize_phone_e164("", "US"), "")
        self.assertEqual(normalize_phone_e164("   ", "US"), "")


class HashPhoneEcTests(SimpleTestCase):
    def test_hashes_e164(self):
        e164 = "+19076176352"
        self.assertEqual(
            hash_phone_ec("(907) 617-6352", country_code="US"),
            sha256_hash(e164),
        )

    def test_invalid_returns_empty(self):
        self.assertEqual(hash_phone_ec("123", country_code="US"), "")
