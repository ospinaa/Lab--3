const express = require("express")
const path = require("path")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())
app.use("/app1", express.static(path.join(__dirname, "app1")))
app.use("/app2", express.static(path.join(__dirname, "app2")))
app.use("/app3", express.static(path.join(__dirname, "app3")))
app.use("/", express.static(path.join(__dirname, "public")))

// Estructura de datos
let users = [
  { id: 1, email: "consumidor@test.com", password: "123", type: "consumer", name: "Juan Consumidor" },
  { id: 2, email: "tienda@test.com", password: "123", type: "store", name: "Admin Tienda", storeId: 1 },
  { id: 3, email: "repartidor@test.com", password: "123", type: "delivery", name: "Carlos Repartidor" }
]

let stores = [
  { id: 1, name: "Fashion Store", address: "Av. Principal 123", isOpen: true, ownerId: 2 },
  { id: 2, name: "Style Boutique", address: "Calle Secundaria 456", isOpen: false, ownerId: 2 }
]

let products = [
  { id: 1, name: "Camiseta Básica Blanca", price: 15.99, description: "Camiseta de algodón 100% color blanco", storeId: 1, stock: 50, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop" },
  { id: 2, name: "Jeans Clásicos Azules", price: 45.99, description: "Jeans azul clásico corte regular", storeId: 1, stock: 30, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop" },
  { id: 3, name: "Vestido Negro Elegante", price: 65.99, description: "Vestido negro para ocasiones especiales", storeId: 2, stock: 20, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop" },
  { id: 4, name: "Sudadera Oversized Gris", price: 35.99, description: "Sudadera cómoda y moderna color gris", storeId: 1, stock: 25, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=300&h=300&fit=crop" },
  { id: 5, name: "Zapatos Deportivos Blancos", price: 89.99, description: "Zapatos deportivos blancos para correr", storeId: 1, stock: 15, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" },
  { id: 6, name: "Chaqueta de Cuero Negra", price: 120.99, description: "Chaqueta de cuero genuino color negro", storeId: 2, stock: 10, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop" },
  { id: 7, name: "Blusa Floral", price: 28.99, description: "Blusa con estampado floral color rosa", storeId: 1, stock: 35, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" },
  { id: 8, name: "Pantalón Cargo Verde", price: 55.99, description: "Pantalón cargo militar color verde", storeId: 1, stock: 20, image: "https://images.unsplash.com/photo-1506629905607-4a4b2b0a0b0b?w=300&h=300&fit=crop" },
  { id: 9, name: "Falda Plisada Negra", price: 32.99, description: "Falda plisada negra para oficina", storeId: 2, stock: 25, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" },
  { id: 10, name: "Abrigo de Lana", price: 95.99, description: "Abrigo de lana color beige para invierno", storeId: 2, stock: 12, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop" }
]

let orders = [
  { 
    id: 1, 
    consumerId: 1, 
    storeId: 1, 
    items: [{ productId: 1, quantity: 2, price: 2.50 }], 
    total: 5.00, 
    status: "pending", 
    paymentMethod: "cash", 
    address: "Calle del Consumidor 789",
    createdAt: new Date().toISOString()
  }
]

let carts = [
  { id: 1, consumerId: 1, items: [{ productId: 2, quantity: 3, price: 1.20 }] }
]

let deliveryOrders = []

// Middleware de autenticación
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ error: "Token de autorización requerido" })
  }
  
  const userId = parseInt(token)
  const user = users.find(u => u.id === userId)
  if (!user) {
    return res.status(401).json({ error: "Usuario no válido" })
  }
  
  req.user = user
  next()
}

// ===== ENDPOINTS DE AUTENTICACIÓN =====

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" })
  }
  
  res.json({ 
    message: "Login exitoso", 
    user: { id: user.id, email: user.email, type: user.type, name: user.name },
    token: user.id.toString()
  })
})

// ===== ENDPOINTS PARA APP DE CONSUMIDOR =====

// Ver todas las tiendas
app.get("/api/consumer/stores", (req, res) => {
  res.json(stores)
})

// Ver detalle de una tienda
app.get("/api/consumer/stores/:id", (req, res) => {
  const storeId = parseInt(req.params.id)
  const store = stores.find(s => s.id === storeId)
  
  if (!store) {
    return res.status(404).json({ error: "Tienda no encontrada" })
  }
  
  res.json(store)
})

// Ver todos los productos de una tienda
app.get("/api/consumer/stores/:id/products", (req, res) => {
  const storeId = parseInt(req.params.id)
  const storeProducts = products.filter(p => p.storeId === storeId)
  res.json(storeProducts)
})

// Ver carrito del usuario
app.get("/api/consumer/cart", authenticateUser, (req, res) => {
  if (req.user.type !== "consumer") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const cart = carts.find(c => c.consumerId === req.user.id)
  if (!cart) {
    return res.json({ items: [] })
  }
  
  // Enriquecer con información del producto
  const enrichedItems = cart.items.map(item => {
    const product = products.find(p => p.id === item.productId)
    return {
      ...item,
      productName: product ? product.name : "Producto no encontrado",
      productDescription: product ? product.description : "",
      productImage: product ? product.image : ""
    }
  })
  
  res.json({ items: enrichedItems })
})

// Agregar producto al carrito
app.post("/api/consumer/cart/add", authenticateUser, (req, res) => {
  if (req.user.type !== "consumer") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const { productId, quantity } = req.body
  const product = products.find(p => p.id === productId)
  
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" })
  }
  
  if (product.stock < quantity) {
    return res.status(400).json({ error: "Stock insuficiente" })
  }
  
  let cart = carts.find(c => c.consumerId === req.user.id)
  if (!cart) {
    cart = { id: carts.length + 1, consumerId: req.user.id, items: [] }
    carts.push(cart)
  }
  
  const existingItem = cart.items.find(item => item.productId === productId)
  if (existingItem) {
    existingItem.quantity += quantity
  } else {
    cart.items.push({ productId, quantity, price: product.price })
  }
  
  res.json({ message: "Producto agregado al carrito" })
})

// Crear orden
app.post("/api/consumer/orders", authenticateUser, (req, res) => {
  if (req.user.type !== "consumer") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const { storeId, paymentMethod, address } = req.body
  const cart = carts.find(c => c.consumerId === req.user.id)
  
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "Carrito vacío" })
  }
  
  const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const order = {
    id: orders.length + 1,
    consumerId: req.user.id,
    storeId,
    items: [...cart.items],
    total,
    status: "pending",
    paymentMethod,
    address,
    createdAt: new Date().toISOString()
  }
  
  orders.push(order)
  
  // Limpiar carrito
  cart.items = []
  
  res.json({ message: "Orden creada exitosamente", order })
})

// Ver órdenes del usuario
app.get("/api/consumer/orders", authenticateUser, (req, res) => {
  if (req.user.type !== "consumer") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const userOrders = orders.filter(o => o.consumerId === req.user.id)
  res.json(userOrders)
})

// ===== ENDPOINTS PARA APP DE TIENDA =====

// Ver información de la tienda
app.get("/api/store/info", authenticateUser, (req, res) => {
  if (req.user.type !== "store") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const store = stores.find(s => s.ownerId === req.user.id)
  if (!store) {
    return res.status(404).json({ error: "Tienda no encontrada" })
  }
  
  res.json(store)
})

// Abrir/cerrar tienda
app.put("/api/store/toggle", authenticateUser, (req, res) => {
  if (req.user.type !== "store") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const store = stores.find(s => s.ownerId === req.user.id)
  if (!store) {
    return res.status(404).json({ error: "Tienda no encontrada" })
  }
  
  store.isOpen = !store.isOpen
  res.json({ message: `Tienda ${store.isOpen ? 'abierta' : 'cerrada'}`, store })
})

// Ver productos de la tienda
app.get("/api/store/products", authenticateUser, (req, res) => {
  if (req.user.type !== "store") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const store = stores.find(s => s.ownerId === req.user.id)
  if (!store) {
    return res.status(404).json({ error: "Tienda no encontrada" })
  }
  
  const storeProducts = products.filter(p => p.storeId === store.id)
  res.json(storeProducts)
})

// Crear producto
app.post("/api/store/products", authenticateUser, (req, res) => {
  if (req.user.type !== "store") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const store = stores.find(s => s.ownerId === req.user.id)
  if (!store) {
    return res.status(404).json({ error: "Tienda no encontrada" })
  }
  
  const { name, price, description, stock, image } = req.body
  
  const product = {
    id: products.length + 1,
    name,
    price,
    description,
    storeId: store.id,
    stock,
    image: image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop"
  }
  
  products.push(product)
  res.json({ message: "Producto creado exitosamente", product })
})

// Ver órdenes de la tienda
app.get("/api/store/orders", authenticateUser, (req, res) => {
  if (req.user.type !== "store") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const store = stores.find(s => s.ownerId === req.user.id)
  if (!store) {
    return res.status(404).json({ error: "Tienda no encontrada" })
  }
  
  const storeOrders = orders.filter(o => o.storeId === store.id)
  res.json(storeOrders)
})

// ===== ENDPOINTS PARA APP DE REPARTIDOR =====

// Ver todas las órdenes disponibles
app.get("/api/delivery/orders", authenticateUser, (req, res) => {
  if (req.user.type !== "delivery") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const availableOrders = orders.filter(o => o.status === "pending")
  res.json(availableOrders)
})

// Ver detalle de una orden
app.get("/api/delivery/orders/:id", authenticateUser, (req, res) => {
  if (req.user.type !== "delivery") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const orderId = parseInt(req.params.id)
  const order = orders.find(o => o.id === orderId)
  
  if (!order) {
    return res.status(404).json({ error: "Orden no encontrada" })
  }
  
  // Enriquecer con información de productos y tienda
  const enrichedItems = order.items.map(item => {
    const product = products.find(p => p.id === item.productId)
    return {
      ...item,
      productName: product ? product.name : "Producto no encontrado",
      productDescription: product ? product.description : ""
    }
  })
  
  const store = stores.find(s => s.id === order.storeId)
  
  res.json({
    ...order,
    items: enrichedItems,
    storeName: store ? store.name : "Tienda no encontrada",
    storeAddress: store ? store.address : ""
  })
})

// Aceptar orden
app.post("/api/delivery/orders/:id/accept", authenticateUser, (req, res) => {
  if (req.user.type !== "delivery") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const orderId = parseInt(req.params.id)
  const order = orders.find(o => o.id === orderId)
  
  if (!order) {
    return res.status(404).json({ error: "Orden no encontrada" })
  }
  
  if (order.status !== "pending") {
    return res.status(400).json({ error: "La orden ya no está disponible" })
  }
  
  order.status = "accepted"
  order.deliveryId = req.user.id
  
  const deliveryOrder = {
    id: deliveryOrders.length + 1,
    orderId: order.id,
    deliveryId: req.user.id,
    acceptedAt: new Date().toISOString(),
    status: "in_progress"
  }
  
  deliveryOrders.push(deliveryOrder)
  
  res.json({ message: "Orden aceptada exitosamente", deliveryOrder })
})

// Ver órdenes aceptadas por el repartidor
app.get("/api/delivery/my-orders", authenticateUser, (req, res) => {
  if (req.user.type !== "delivery") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const myDeliveryOrders = deliveryOrders.filter(deliveryOrder => deliveryOrder.deliveryId === req.user.id)
  const enrichedOrders = myDeliveryOrders.map(deliveryOrder => {
    const order = orders.find(o => o.id === deliveryOrder.orderId)
    return {
      ...deliveryOrder,
      order: order
    }
  })
  
  res.json(enrichedOrders)
})

// Completar entrega
app.put("/api/delivery/orders/:id/complete", authenticateUser, (req, res) => {
  if (req.user.type !== "delivery") {
    return res.status(403).json({ error: "Acceso denegado" })
  }
  
  const orderId = parseInt(req.params.id)
  const order = orders.find(o => o.id === orderId)
  
  if (!order) {
    return res.status(404).json({ error: "Orden no encontrada" })
  }
  
  if (order.deliveryId !== req.user.id) {
    return res.status(403).json({ error: "No tienes permisos para completar esta orden" })
  }
  
  order.status = "delivered"
  
  const deliveryOrder = deliveryOrders.find(deliveryOrder => deliveryOrder.orderId === orderId)
  if (deliveryOrder) {
    deliveryOrder.status = "completed"
    deliveryOrder.completedAt = new Date().toISOString()
  }
  
  res.json({ message: "Entrega completada exitosamente" })
})

app.listen(5050, () => {
  console.log("Servidor corriendo en puerto 5050")
})