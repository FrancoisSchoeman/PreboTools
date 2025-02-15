from ninja import NinjaAPI
from ai_feed_optimiser.api import router as ai_feed_optimiser_router


api = NinjaAPI()

api.add_router("/feed-optimiser", ai_feed_optimiser_router)
