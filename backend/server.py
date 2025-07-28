from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Product Models
class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str  # "geeks", "gel-dor", "diversos"
    image_url: str
    in_stock: bool = True
    stock_quantity: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    in_stock: bool = True
    stock_quantity: int = 0

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    items: List[OrderItem]
    total: float
    status: str = "pending"  # pending, processing, completed, cancelled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    customer_address: str
    items: List[OrderItem]
    total: float

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int

# Product Routes
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_all_products():
    products = await db.products.find().to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/category/{category}", response_model=List[Product])
async def get_products_by_category(category: str):
    products = await db.products.find({"category": category}).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if product:
        return Product(**product)
    raise HTTPException(status_code=404, detail="Produto não encontrado")

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    order_dict = order.dict()
    order_obj = Order(**order_dict)
    await db.orders.insert_one(order_obj.dict())
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find().to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if order:
        return Order(**order)
    raise HTTPException(status_code=404, detail="Pedido não encontrado")

# Initialize sample data
@api_router.post("/init-data")
async def init_sample_data():
    # Check if products already exist
    existing_products = await db.products.find().to_list(10)
    if existing_products:
        return {"message": "Dados já existem"}
    
    sample_products = [
        # Produtos Geeks
        {
            "id": str(uuid.uuid4()),
            "name": "Camiseta Star Wars",
            "description": "Camiseta 100% algodão com estampa dos filmes Star Wars",
            "price": 45.99,
            "category": "geeks",
            "image_url": "https://images.unsplash.com/photo-1657812159075-7f0abd98f7b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxlLWNvbW1lcmNlfGVufDB8fHx8MTc1MzcwMTQwOHww&ixlib=rb-4.1.0&q=85",
            "in_stock": True,
            "stock_quantity": 50,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mousepad Gamer RGB",
            "description": "Mousepad com iluminação RGB e base antiderrapante",
            "price": 89.90,
            "category": "geeks",
            "image_url": "https://images.unsplash.com/photo-1658297063569-162817482fb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxlLWNvbW1lcmNlfGVufDB8fHx8MTc1MzcwMTQwOHww&ixlib=rb-4.1.0&q=85",
            "in_stock": True,
            "stock_quantity": 30,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Caneca Marvel",
            "description": "Caneca temática dos heróis da Marvel com 350ml",
            "price": 25.50,
            "category": "geeks",
            "image_url": "https://images.unsplash.com/photo-1713646778050-2213b4140e6b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBzaG9wcGluZ3xlbnwwfHx8fDE3NTM3MDE0MTN8MA&ixlib=rb-4.1.0&q=85",
            "in_stock": True,
            "stock_quantity": 75,
            "created_at": datetime.utcnow()
        },
        # Gel para Dor
        {
            "id": str(uuid.uuid4()),
            "name": "Gel Anti-inflamatório 60g",
            "description": "Gel para alívio de dores musculares e articulares",
            "price": 18.99,
            "category": "gel-dor",
            "image_url": "https://images.unsplash.com/photo-1539278383962-a7774385fa02?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxvbmxpbmUlMjBzaG9wcGluZ3xlbnwwfHx8fDE3NTM3MDE0MTN8MA&ixlib=rb-4.1.0&q=85",
            "in_stock": True,
            "stock_quantity": 100,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Gel Relaxante Muscular 120g",
            "description": "Gel com mentol para relaxamento muscular profundo",
            "price": 32.50,
            "category": "gel-dor",
            "image_url": "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg",
            "in_stock": True,
            "stock_quantity": 80,
            "created_at": datetime.utcnow()
        },
        # Diversos
        {
            "id": str(uuid.uuid4()),
            "name": "Organizador de Mesa",
            "description": "Organizador de mesa em madeira com compartimentos",
            "price": 67.90,
            "category": "diversos",
            "image_url": "https://images.unsplash.com/photo-1657812159075-7f0abd98f7b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxlLWNvbW1lcmNlfGVufDB8fHx8MTc1MzcwMTQwOHww&ixlib=rb-4.1.0&q=85",
            "in_stock": True,
            "stock_quantity": 25,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Lanterna LED Recarregável",
            "description": "Lanterna LED potente com carregador USB",
            "price": 45.99,
            "category": "diversos",
            "image_url": "https://images.unsplash.com/photo-1658297063569-162817482fb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwzfHxlLWNvbW1lcmNlfGVufDB8fHx8MTc1MzcwMTQwOHww&ixlib=rb-4.1.0&q=85",
            "in_stock": True,
            "stock_quantity": 40,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.products.insert_many(sample_products)
    return {"message": "Dados de exemplo criados com sucesso!"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()