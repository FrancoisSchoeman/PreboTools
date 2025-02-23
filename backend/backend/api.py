from ninja import NinjaAPI
from ai_feed_optimiser.api import router as ai_feed_optimiser_router
from keyword_analyser.api import router as keyword_analyser_router
from image_resizer.api import router as image_resizer_router
from backend.api_header_key import header_key


api = NinjaAPI(auth=header_key)

api.add_router("/feed-optimiser", ai_feed_optimiser_router)
api.add_router("/keyword-analyser", keyword_analyser_router)
api.add_router("/image-resizer", image_resizer_router)
