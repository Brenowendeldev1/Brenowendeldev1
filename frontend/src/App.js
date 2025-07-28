import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cart Context
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getCartTotal,
      getCartItemsCount,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Header Component
const Header = () => {
  const { getCartItemsCount } = useCart();
  
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <a href="/">🛒 Loja Online</a>
        </h1>
        <nav className="flex items-center space-x-6">
          <a href="/" className="hover:text-blue-200 transition-colors">Início</a>
          <a href="/produtos" className="hover:text-blue-200 transition-colors">Produtos</a>
          <a href="/carrinho" className="hover:text-blue-200 transition-colors flex items-center">
            <span className="mr-2">🛒</span>
            Carrinho ({getCartItemsCount()})
          </a>
        </nav>
      </div>
    </header>
  );
};

// Home Page
const Home = () => {
  const categories = [
    {
      id: "geeks",
      name: "Produtos Geeks",
      description: "Itens para os apaixonados por tecnologia e cultura pop",
      image: "https://images.unsplash.com/photo-1657812159075-7f0abd98f7b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxlLWNvbW1lcmNlfGVufDB8fHx8MTc1MzcwMTQwOHww&ixlib=rb-4.1.0&q=85",
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "gel-dor",
      name: "Gel para Dor",
      description: "Produtos para alívio de dores musculares e articulares",
      image: "https://images.unsplash.com/photo-1539278383962-a7774385fa02?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxvbmxpbmUlMjBzaG9wcGluZ3xlbnwwfHx8fDE3NTM3MDE0MTN8MA&ixlib=rb-4.1.0&q=85",
      color: "from-green-500 to-teal-500"
    },
    {
      id: "diversos",
      name: "Diversos",
      description: "Variedade de produtos úteis para o dia a dia",
      image: "https://images.unsplash.com/photo-1713646778050-2213b4140e6b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBzaG9wcGluZ3xlbnwwfHx8fDE3NTM3MDE0MTN8MA&ixlib=rb-4.1.0&q=85",
      color: "from-orange-500 to-red-500"
    }
  ];

  const initData = async () => {
    try {
      await axios.post(`${API}/init-data`);
      console.log("Dados inicializados");
    } catch (error) {
      console.log("Dados já existem ou erro:", error);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Bem-vindo à Nossa Loja Online
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Descubra os melhores produtos em tecnologia geek, saúde e muito mais. 
            Compre com segurança e receba em casa!
          </p>
          <a 
            href="/produtos" 
            className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Ver Produtos
          </a>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nossas Categorias
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white text-center`}>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-white/90">{category.description}</p>
                </div>
                <div className="p-6">
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <a 
                    href={`/categoria/${category.id}`}
                    className="block w-full bg-gray-800 text-white text-center py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Ver Produtos
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">Receba seus produtos em até 3 dias úteis</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2">Pagamento Seguro</h3>
              <p className="text-gray-600">Múltiplas formas de pagamento disponíveis</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Garantia Total</h3>
              <p className="text-gray-600">7 dias para trocar ou devolver</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Products Page
const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();

  const categories = [
    { id: 'all', name: 'Todos os Produtos' },
    { id: 'geeks', name: 'Produtos Geeks' },
    { id: 'gel-dor', name: 'Gel para Dor' },
    { id: 'diversos', name: 'Diversos' }
  ];

  const fetchProducts = async () => {
    try {
      const response = selectedCategory === 'all' 
        ? await axios.get(`${API}/products`)
        : await axios.get(`${API}/products/category/${selectedCategory}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Nossos Produtos</h1>
        
        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow p-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg mx-1 transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.in_stock ? 'Em estoque' : 'Fora de estoque'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    addToCart(product);
                    alert('Produto adicionado ao carrinho!');
                  }}
                  disabled={!product.in_stock}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    product.in_stock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.in_stock ? 'Adicionar ao Carrinho' : 'Indisponível'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Category Page
const CategoryPage = ({ category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const categoryNames = {
    'geeks': 'Produtos Geeks',
    'gel-dor': 'Gel para Dor',
    'diversos': 'Diversos'
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/products/category/${category}`);
        setProducts(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          {categoryNames[category] || 'Categoria'}
        </h1>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.in_stock ? 'Em estoque' : 'Fora de estoque'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    addToCart(product);
                    alert('Produto adicionado ao carrinho!');
                  }}
                  disabled={!product.in_stock}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    product.in_stock
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.in_stock ? 'Adicionar ao Carrinho' : 'Indisponível'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Cart Page
const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isCheckout, setIsCheckout] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    const orderData = {
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      items: cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: getCartTotal()
    };

    try {
      const response = await axios.post(`${API}/orders`, orderData);
      console.log('Pedido criado:', response.data);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">Pedido Realizado com Sucesso!</h1>
            <p className="text-gray-600 mb-6">
              Obrigado por sua compra! Você receberá um e-mail de confirmação em breve.
            </p>
            <a 
              href="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar à Loja
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Seu Carrinho</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
            <p className="text-gray-600 mb-6">Adicione alguns produtos para continuar</p>
            <a 
              href="/produtos" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Produtos
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Itens do Carrinho</h2>
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center border-b border-gray-200 py-4 last:border-b-0">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-green-600 font-bold">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 bg-gray-100 rounded">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {getCartTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Dados para Entrega</h2>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço Completo *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, número, bairro, cidade, CEP"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg"
                >
                  Finalizar Pedido - R$ {getCartTotal().toFixed(2)}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Router Setup
const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/produtos" element={<Products />} />
      <Route path="/categoria/geeks" element={<CategoryPage category="geeks" />} />
      <Route path="/categoria/gel-dor" element={<CategoryPage category="gel-dor" />} />
      <Route path="/categoria/diversos" element={<CategoryPage category="diversos" />} />
      <Route path="/carrinho" element={<Cart />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <CartProvider>
        <BrowserRouter>
          <Header />
          <AppRouter />
        </BrowserRouter>
      </CartProvider>
    </div>
  );
}

export default App;