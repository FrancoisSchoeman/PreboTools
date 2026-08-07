from ninja import NinjaAPI
from ai_feed_optimiser.api import router as ai_feed_optimiser_router
from keyword_analyser.api import router as keyword_analyser_router
from image_resizer.api import router as image_resizer_router
from lead_gen.api import router as lead_gen_router
from lead_gen.api_public import router as lead_gen_public_router
from sitemap_to_csv.api import router as sitemap_to_csv_router
from sitemap_to_markdown.api import router as sitemap_to_markdown_router
from url_structure_breaker.api import router as url_structure_breaker_router
from gmc_xml_to_csv.api import router as gmc_xml_to_csv_router
from backend.api_header_key import header_key


api = NinjaAPI(auth=header_key)
public_api = NinjaAPI(auth=None, urls_namespace="lead-gen-public")

api.add_router("/feed-optimiser", ai_feed_optimiser_router)
api.add_router("/keyword-analyser", keyword_analyser_router)
api.add_router("/image-resizer", image_resizer_router)
api.add_router("/lead-gen", lead_gen_router)
api.add_router("/sitemap-to-csv", sitemap_to_csv_router)
api.add_router("/sitemap-to-markdown", sitemap_to_markdown_router)
api.add_router("/url-structure-breaker", url_structure_breaker_router)
api.add_router("/gmc-xml-to-csv", gmc_xml_to_csv_router)

public_api.add_router("/lead-gen", lead_gen_public_router)
